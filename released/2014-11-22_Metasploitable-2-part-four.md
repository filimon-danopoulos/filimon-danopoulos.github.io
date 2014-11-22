<!--hacking, metasploit, telnet-->
# Back to basics

This is the fourth part of my series about hacking a Metasploitable 2 VM. You can find the previous posts here:

* [Part one](http://filimon-danopoulos.github.io/posts/2014-11-12_Metasploitable-2-part-one.html)
* [Part two](http://filimon-danopoulos.github.io/posts/2014-11-15_Metasploitable-2-part-two.html)
* [Part three](http://filimon-danopoulos.github.io/posts/2014-11-17_Metasploitable-2-part-three.html)

In this post I will continue down the list of services that the `nmap` scan I did in part one generated:

    PORT      STATE SERVICE     VERSION
    21/tcp    open  ftp         vsftpd 2.3.4
    22/tcp    open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
    23/tcp    open  telnet      Linux telnetd
    25/tcp    open  smtp        Postfix smtpd
    53/tcp    open  domain      ISC BIND 9.4.2
    80/tcp    open  http        Apache httpd 2.2.8 ((Ubuntu) DAV/2)
    111/tcp   open  rpcbind     2 (RPC #100000)
    139/tcp   open  netbios-ssn Samba smbd 3.X (workgroup: WORKGROUP)
    445/tcp   open  netbios-ssn Samba smbd 3.X (workgroup: WORKGROUP)
    512/tcp   open  exec        netkit-rsh rexecd
    513/tcp   open  login?
    514/tcp   open  shell?
    1099/tcp  open  rmiregistry GNU Classpath grmiregistry
    1524/tcp  open  shell       Metasploitable root shell
    2049/tcp  open  nfs         2-4 (RPC #100003)
    2121/tcp  open  ftp         ProFTPD 1.3.1
    3306/tcp  open  mysql       MySQL 5.0.51a-3ubuntu5
    3632/tcp  open  distccd     distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))
    5432/tcp  open  postgresql  PostgreSQL DB 8.3.0 - 8.3.7
    5900/tcp  open  vnc         VNC (protocol 3.3)
    6000/tcp  open  X11         (access denied)
    6667/tcp  open  irc         Unreal ircd
    6697/tcp  open  irc         Unreal ircd
    8009/tcp  open  ajp13       Apache Jserv (Protocol v1.3)
    8180/tcp  open  http        Apache Tomcat/Coyote JSP engine 1.1
    8787/tcp  open  drb         Ruby DRb RMI (Ruby 1.8; path /usr/lib/ruby/1.8/drb)
    35308/tcp open  status      1 (RPC #100024)
    47882/tcp open  nlockmgr    1-4 (RPC #100021)
    50137/tcp open  unknown
    54408/tcp open  mountd      1-3 (RPC #100005)
    
The FTP and SSH services running on port 21 and 22 respectively have both been compromised. 
So this time I will focus on telnet running on port 23.

## The target

Telnet, telnet, where to begin... Generally, telnet is a good indicator that something is misconfigured. There are modern
alternatives that almost always are a better fit, SSH for example.
The easiest thing to do as far as telnet is concerned is just connect to it with the `telnet` command:

    # telnet 192.168.56.103
    Trying 192.168.56.103...
    Connected to 192.168.56.103.
    Escape character is '^]'.
                    _                  _       _ _        _     _      ____  
     _ __ ___   ___| |_ __ _ ___ _ __ | | ___ (_) |_ __ _| |__ | | ___|___ \ 
    | '_ ` _ \ / _ \ __/ _` / __| '_ \| |/ _ \| | __/ _` | '_ \| |/ _ \ __) |
    | | | | | |  __/ || (_| \__ \ |_) | | (_) | | || (_| | |_) | |  __// __/ 
    |_| |_| |_|\___|\__\__,_|___/ .__/|_|\___/|_|\__\__,_|_.__/|_|\___|_____|
                                |_|                                          


    Warning: Never expose this VM to an untrusted network!

    Contact: msfdev[at]metasploit.com

    Login with msfadmin/msfadmin to get started


    metasploitable login:
    
OK. That was easy, it actually straight out tells me a username password combo to try... Let's see what happens if I use the
supplied credentials.

    metasploitable login: msfadmin
    Password: 
    Last login: Sun Nov  9 05:31:34 EST 2014 on pts/1
    Linux metasploitable 2.6.24-16-server #1 SMP Thu Apr 10 13:58:00 UTC 2008 i686

    The programs included with the Ubuntu system are free software;
    the exact distribution terms for each program are described in the
    individual files in /usr/share/doc/*/copyright.

    Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
    applicable law.

    To access official Ubuntu documentation, please visit:
    http://help.ubuntu.com/
    No mail.
    msfadmin@metasploitable:~$
    
So that was easy, might this user have `sudo` rights?
    
    msfadmin@metasploitable:~$ sudo su
    [sudo] password for msfadmin: 
    root@metasploitable:/home/msfadmin# whoami
    root

Well there you go, I have root.

## Alternatives

Since this makes for a pretty boring post if I don't do anything more than this let's see if there is something in Metasploit, 
so I fire up `msfconsole`: 

    msf > search telnetd

    Matching Modules
    ================

     Name                                               Rank       Description
     ----                                               ----       -----------
     auxiliary/admin/http/dlink_dir_300_600_exec_noauth normal     D-Link DIR-600 / DIR-300 Unauthenticated 
                                                                   Remote Command Execution
     auxiliary/scanner/telnet/telnet_encrypt_overflow   normal     Telnet Service Encyption Key ID Overflow 
                                                                   Detection
     exploit/linux/http/dlink_diagnostic_exec_noauth    excellent  D-Link DIR-645 / DIR-815 diagnostic.php 
                                                                   Command Execution
     exploit/linux/telnet/telnet_encrypt_keyid          great      Linux BSD-derived Telnet Service 
                                                                   Encryption Key ID Buffer Overflow
     exploit/solaris/telnet/fuser                       excellent  Sun Solaris Telnet Remote Authentication 
                                                                   Bypass Vulnerability
     exploit/solaris/telnet/ttyprompt                   excellent  Solaris in.telnetd TTYPROMPT Buffer Overflow

There seems to exist some kind of encryption overflow `exploit/linux/telnet/telnet_encrypt_keyid` (output shortened): 
    
    msf>  info  exploit/linux/telnet/telnet_encrypt_keyid 

    Name: Linux BSD-derived Telnet Service Encryption Key ID Buffer Overflow
    Module: exploit/linux/telnet/telnet_encrypt_keyid
    Platform: Linux
    Privileged: Yes
    License: Metasploit Framework License (BSD)
    Rank: Great
    Disclosed: 2011-12-23

    Available targets:
      Id  Name
      --  ----
      0   Automatic
      1   Red Hat Enterprise Linux 3 (krb5-telnet)

    Payload information:
      Space: 200
      Avoid: 1 characters

    Description:
      This module exploits a buffer overflow in the encryption option 
      handler of the Linux BSD-derived telnet service (inetutils or 
      krb5-telnet). Most Linux distributions use NetKit-derived telnet 
      daemons, so this flaw only applies to a small subset of Linux 
      systems running telnetd.

    References:
      http://cvedetails.com/cve/2011-4862/
      http://www.osvdb.org/78020
      http://www.securityfocus.com/bid/51182
      http://www.exploit-db.com/exploits/18280
      
This does not sound very promising but let's run the scanner `auxiliary/scanner/telnet/telnet_encrypt_overflow`:

    msf > use auxiliary/scanner/telnet/telnet_encrypt_overflow
    msf auxiliary(telnet_encrypt_overflow) > show options

    Module options (auxiliary/scanner/telnet/telnet_encrypt_overflow):

       Name      Current Setting  Required  Description
       ----      ---------------  --------  -----------
       PASSWORD                   no        The password for the specified username
       RHOSTS                     yes       The target address range or CIDR identifier
       RPORT     23               yes       The target port
       THREADS   1                yes       The number of concurrent threads
       TIMEOUT   30               yes       Timeout for the Telnet probe
       USERNAME                   no        The username to authenticate as

    msf auxiliary(telnet_encrypt_overflow) > set RHOSTS 192.168.56.103
    RHOSTS => 192.168.56.103
    msf auxiliary(telnet_encrypt_overflow) > run

    [*] 192.168.56.103:23 Does not support encryption: *snipp*
    [*] Scanned 1 of 1 hosts (100% complete)
    [*] Auxiliary module execution completed

The target is not vulnerable this attack. It doesn't really matter at this point, but it's good to know that this issue exists,
for future reference.

## The point

OK, in order for this post to have even the slightest amount of substance let's see what we can take away from this. 
If we have a service that is known to be configured improperly just try to connect to it and see that happens. In this case the target 
more or less hacked it self. Next time I will try to do some thing more interesting than this.

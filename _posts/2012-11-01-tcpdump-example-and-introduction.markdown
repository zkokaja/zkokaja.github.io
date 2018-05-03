---
layout: post
title: tcpdump Example and Introduction
date: 2012-11-01 15:22:13 -04:00
type: post
published: true
status: publish
categories: [networking]
tags: [tcpdump]
---

Networking is really cool. Not many people know what's going on behind their computers when they type google.com into their web browsers. Even some of the tech-savvy people may have never been interested in this topic. It is interesting however. In this blog post I want to quickly introduce the concepts using tcpdump (an amazing tool). So let's dig in.

First thing, what is tcpdump? From the man pages:

NAME
tcpdump - dump traffic on a network
DESCRIPTION
Tcpdump prints out a description of the contents of packets on a network interface that
match the boolean expression. It can also be run with the -w flag, which causes it to
save the packet data to a file for later analysis, and/or with the -r flag, which
causes it to read from a saved packet file rather than to read packets from a network
interface. In all cases, only packets that match expression will be processed by tcp-
dump.

Now, we're going to run tcpdump, to capture our packets and write it to a file, and at the same time use curl to get us an html file from a website. Let's make it a very simple web page:

{% highlight bash %}
$ curl http://www.csun.edu/~sgs/htmlintro/ex1.html
{% endhighlight %}

{% highlight html %}
<HTML>
  <HEAD>
    <TITLE>Window Title</TITLE>
  </HEAD>
  <BODY>
    <P>A paragraph of text in the body of the document.</P>
    <P>A second paragraph of text.</P>
  </BODY>
</HTML>
{% endhighlight %}

Now we can stop - recording via - tcpdump, and dig into the packets. First off, let's just read the packets with the -S flag which "Print absolute, rather than relative, TCP sequence numbers" and -t to remove timestamps. I'll break this down so we can get a better understanding of what's happening:

{% highlight bash %}
$ tcpdump -r GETsimple -St
reading from file GETsimple, link-type EN10MB (Ethernet)
{% endhighlight %}

Here we are just reading from our saved file, pretty basic.

    ARP, Request who-has 10.0.2.2 tell 10.0.2.15, length 28
    ARP, Reply 10.0.2.2 is-at 52:54:00:12:35:02 (oui Unknown), length 46

All of this is ARP, which is a protocol that is used to retrieve the MAC (ethernet) address of a machine. I've omitted 4 IP lines that are not necessary here.

    IP 10.0.2.15.46606 > www.csun.edu.http: Flags [S], seq 1295001022, win 14600, options [mss 1460,sackOK,TS val 473561 ecr 0,nop,wscale 7], length 0
    IP www.csun.edu.http > 10.0.2.15.46606: Flags [S.], seq 64001, ack 1295001023, win 65535, options [mss 1460], length 0
    IP 10.0.2.15.46606 > www.csun.edu.http: Flags [.], ack 64002, win 14600, length 0

This is where it gets interesting. This is the first part of our TCP connection! TCP is a protocol that uses "connections"; so it's natural that the first part is a handshake. Which is what we see above.

1. My computer sends a TCP packet with the SYN flag on (as seen above) to the server that is passively listening for these packets.
2. The server got our SYN! And it responds with another SYN (S) and an ACK (.); so it acknowledges that it received our packet.
3. One last thing, we (the client) need to send an ACK to the server, telling it we got its ACK.

We have a FULL-DUPLEX connection now! Now notice if you will the numbers on the output to the right of the Flags section. In the first line when we send the first SYN, we choose a random sequence number that helps us keep track of packets. When the server ACKS our SYN, you can see the ACK number is one more than the sequence number we sent! That means that it has acknowledged that sequence, and is ready for the next one. Notice also that it chooses a different sequence number, 64001, which is also random; and also notice that when we ACK the server's SYN, we send an ack of 64002! Sequence numbers and ACKs are the basics of TCP. It gets more complicated with window sizing and various options that we will not get into.

    IP 10.0.2.15.46606 > www.csun.edu.http: Flags [P.], seq 1295001023:1295001122, ack 64002, win 14600, length 99
    IP www.csun.edu.http > 10.0.2.15.46606: Flags [.], ack 1295001122, win 65535, length 0
    IP www.csun.edu.http > 10.0.2.15.46606: Flags [P.], seq 64002:64388, ack 1295001122, win 65535, length 386
    IP 10.0.2.15.46606 > www.csun.edu.http: Flags [.], ack 64388, win 15544, length 0

So what do we do with a connection? Send data of course. We can see that on the first line here, we are the ones who are sending a packet, of something to the server. Our first packet is of length 99, and then we see the server replies with an ACK. So the server has received what we sent.. hmm. Right after, we get another packet from the server, with a length of 386! This has got to be good. And of course to be good TCP users, we reply with an ACK that we received their packet.

    IP 10.0.2.15.46606 > www.csun.edu.http: Flags [F.], seq 1295001122, ack 64388, win 15544, length 0
    IP www.csun.edu.http > 10.0.2.15.46606: Flags [.], ack 1295001123, win 65535, length 0
    IP www.csun.edu.http > 10.0.2.15.46606: Flags [F.], seq 64388, ack 1295001123, win 65535, length 0
    IP 10.0.2.15.46606 > www.csun.edu.http: Flags [.], ack 64389, win 15544, length 0

Now it's time to close the connection. The process for this is simple: Each party sends a FIN flagged packet, and other must ACK that they received it. Once both FINs and ACKs are received, the connection is happily terminated.

So now you're wondering, well what about all the data I want to see! There's got to be some way tcpdump can give me that information.

There are indeed several ways we can accomplish this.

{% highlight bash %}
    $ tcpdump -r GETsimple -S proto TCP and ip host 10.0.2.15 -X
{% endhighlight %}

This will show us all TCP protocol packets AND that have the host as me in either source or destination; and the important flag is -X which will print out the payload or the data of each packet in HEX and in ASCII. This isn't as easily read as -A, which is optimized for web pages:

{% highlight bash %}
    $ tcpdump -r GETsimple -S proto TCP and ip host 10.0.2.15 -A
{% endhighlight %}

Which will show two interesting packets that I have trimmed here:

    IP 10.0.2.15.46606 > www.csun.edu.http: Flags [P.], seq 1295001023:1295001122, ack 64002, win 14600, length 99
    E....i@.@...
    ..........PM0%.....P.9.}...GET /~sgs/htmlintro/ex1.html HTTP/1.1
    User-Agent: curl/7.28.0
    Host: www.csun.edu
    Accept: */*

This is the first packet that we sent to the server. This is, as it says in there, HTTP! Since we used curl, it put these strings together and told the webserver that it wants to GET the ex1.html file in that location. This is a normal HTTP header request.

    IP www.csun.edu.http > 10.0.2.15.46606: Flags [P.], seq 64002:64388, ack 1295001122, win 65535, length 386
    E.......@.......
    ....P......M0&amp;amp;"P...g!..HTTP/1.1 200 OK
    Date: Wed, 31 Oct 2012 21:08:55 GMT
    Server: Apache/2.2.3 (Red Hat)
    Last-Modified: Sat, 23 May 2009 01:12:13 GMT
    ETag: "9e-46a8a112c7540"
    Accept-Ranges: bytes
    Content-Length: 158
    Content-Type: text/html

    <HTML>
    <HEAD>
    <TITLE>Window Title</TITLE>
    </HEAD>
    <BODY>
    <P>A paragraph of text in the body of the document.</P>
    <P>A second paragraph of text.</P>
    </BODY>
    </HTML>

This is the server's reply where you can see the HTTP response header, and the data, the actual HTML!

So the cool part about this? We just traced a whole request, from putting in the the URL in your browser (or using curl), to getting the HTML (but not rendered graphically) all through tcpdump! This is the simplest example of using this tool, it can actually handle many protocols and uses pcap-filter (you can man that too) to filter the packets. It is very powerful. Now that you've got the basic introduction, check our `man tcpdump' where it explains all of this better than I have :)

Z


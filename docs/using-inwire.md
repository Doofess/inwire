# Using Inwire

What each part of the app does, and its limits.

## Working with traffic

You can capture from several adapters at once, narrow the capture with a
filter, or set it to start and stop on a schedule. Ring files let you keep
recording within a limit you choose.

The parser covers **142 dissected layers**, including DNS, TLS, QUIC, HTTP/1–3,
Windows networking and flow-export protocols. Display filters use Wireshark
field names, so familiar filters carry over.

Once you have a capture, you can:

- Inspect a packet's fields alongside its bytes, or follow a TCP, UDP or QUIC
  conversation in a ladder view.
- Load an SSL key log to read TLS and QUIC traffic, including HTTP/2 and HTTP/3.
- Find the process behind a connection and see which direction its traffic went.
- Look through conversations, endpoints, protocols and expert findings, or plot
  traffic and packet sizes. Statistics and the map use the packets currently
  in memory; the packet list and display filter can reach the whole capture.
- Compare the machine's network settings with what the capture shows, and run
  an internet speed test from the Network sidebar.
- Export packets to pcapng, pcap, CSV, JSON or Excel, create a PDF analysis report,
  or anonymise a capture before sharing it.

Captures are stored on disk. You can reopen the previous session after a
restart and reach packets that have left the memory buffer. Replacing a capture
requires your decision; a scheduled start warns about replacement when you arm
it, and a ring can remove its oldest files according to the limits you set.

Exports include the whole capture or the packets matching your display filter.
Excel has a size limit because the workbook has to fit in memory; for larger
exports, use CSV.

The app has Light, Dark, Dim and High Contrast themes, plus an option to follow
Windows.

## Watching a network

Inwire can also collect NetFlow v5, NetFlow v9 or IPFIX from one router,
firewall or `softflowd`.
It listens on an address and port you choose (2055 by default) and keeps a
history on disk, up to a storage limit you set, that survives a restart. The
Monitoring screen, opened from the Network sidebar, shows traffic over time,
top endpoints and top conversations for any range, and one click on a host
filters the capture by it. Collection runs apart from capture, so starting,
clearing or importing a capture leaves it alone. Sampled counts are shown as
reported, with the estimate labelled as one. Its numbers are checked against
tshark's and nfdump's decode of `softflowd`'s and pmacct's exports.

![The Monitoring sheet receiving NetFlow v5 from one exporter](images/monitoring.png)

sFlow can be inspected inside a packet capture, but isn't collected, and
neither is IPFIX over TCP or SCTP.

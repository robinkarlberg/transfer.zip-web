import { Link } from "react-router-dom";

export default function AboutPage({ }) {
    return (
        <main className="flex-grow-1">
            {/* <div id="heading-container" className="container pb-4">
                <h1 className="display-5 fw-medium mb-0">About</h1>
            </div> */}

            <div className="container py-2 pt-4">
                <h1 className="h3">About this site</h1>
                <p>
                    <a href="/">transfer.zip</a> is an open source web application that allows you to easily transfer files between two devices. 
                    At the moment, transfer.zip is the easiest and most secure way to share files on the web. There is no signup, 
                    no wait and no bullshit, and the files can be as large as you want.
                </p>

                <p>
                    It uses <a href="http://www.webrtc.org/">WebRTC</a> for peer-to-peer data transfer, meaning the files are streamed directly between peers and not 
                    stored anywhere in the process, not even on transfer.zip servers. To let peers initially discover each other, 
                    a signaling server is implemented in NodeJS using WebSockets, which importantly no sensitive data is sent through. 
                    In addition, the file data is end-to-end encrypted using <a href="https://en.wikipedia.org/wiki/Galois/Counter_Mode">AES-GCM</a> with a client-side 256 bit generated key, 
                    meaning if someone could impersonate a peer or capture the traffic, they would not be able to decrypt the file 
                    without knowing the key. Because the file is streamed directly between peers, there are <b>no file size or bandwidth limitations.</b>
                </p>

                <p>
                    The easiest way to transfer a file is to scan the QR code containing the file link and encryption key. 
                    It is also possible to copy the link and share it to the receiving end over what medium you prefer the most.
                </p>

                <p>
                    Sounds interesting? <Link to="/">Try it out!</Link>
                </p>
            </div>
        </main>
    )
}
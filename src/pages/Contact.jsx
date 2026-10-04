import { useEffect, useState } from "react";
import { HomeHeader, Shell } from "../components/Chrome.jsx";

const CONTACT_API = "https://ntfy.sh/compl3xlife-js-final";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    document.title = "Contact | Blinker";
  }, []);

  async function submit(event) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch(CONTACT_API, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Title: "Blinker contact",
          Tags: "email",
        },
        body: `${name} <${email}>\n\n${message}`,
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Shell variant="home" header={<HomeHeader />}>
      <section className="movie-page">
        <h1 className="movie-title">Contact</h1>
        <p className="movie-plot">Send a message and it is delivered through the contact API.</p>
        {status === "sent" ? (
          <p className="movie-awards">Message sent.</p>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label>
              Message
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={6} />
            </label>
            <button className="watch-btn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            {status === "error" ? <p className="contact-error">The contact API did not accept the message. Try again.</p> : null}
          </form>
        )}
      </section>
    </Shell>
  );
}

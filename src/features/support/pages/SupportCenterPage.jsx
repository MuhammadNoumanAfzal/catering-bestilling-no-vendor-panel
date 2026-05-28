import SupportTicketForm from "../components/SupportTicketForm";

export default function SupportCenterPage() {
  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <header className="mb-5">
        <h1 className="type-h2 m-0 text-[#15110f]">Support Center</h1>
        <p className="type-para mt-1 text-[#746a62]">
          We&apos;re here to help. Find answers or get in touch with our team.
        </p>
      </header>

      <SupportTicketForm />
    </section>
  );
}

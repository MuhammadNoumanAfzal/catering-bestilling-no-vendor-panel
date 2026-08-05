import { Link } from "react-router-dom";
import SupportTicketForm from "../components/SupportTicketForm";

export default function SupportCenterPage() {
  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="type-h2 m-0 text-[#15110f]">Support Center</h1>
          <p className="type-para mt-1 text-[#746a62]">
            We&apos;re here to help. Find answers or get in touch with our team.
          </p>
        </div>

        <Link
          className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#dfd3c8] bg-white px-4 text-[14px] font-bold text-[#2a211b] no-underline transition hover:bg-[#faf6f2] hover:text-[#cf6e38]"
          to="/support/responses"
        >
          View Responses
        </Link>
      </header>

      <SupportTicketForm />
    </section>
  );
}

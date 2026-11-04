import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactActionsProps = {
  name: string;
  email?: string | null;
  phone?: string | null;
};

export function ContactActions({ name, email, phone }: ContactActionsProps) {
  const recipient = email?.trim();
  const whatsappNumber = phone?.replace(/\D/g, "") ?? "";

  if (!recipient && !whatsappNumber) return null;

  return (
    <div className="inline-flex shrink-0 items-center gap-1">
      {recipient && (
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={`Email ${name} in Gmail`}
          title="Compose email in Gmail"
        >
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail className="h-4 w-4 text-slate-600" />
          </a>
        </Button>
      )}
      {whatsappNumber && (
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={`Message ${name} on WhatsApp`}
          title="Message on WhatsApp"
        >
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
          </a>
        </Button>
      )}
    </div>
  );
}

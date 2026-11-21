import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import FAQSection from "@/components/FAQSection";
import PartnershipsCertificates from "@/components/contact/PartnershipsCertificates";


export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactForm/>
      
      <FAQSection/>
        <PartnershipsCertificates/>
    </main>
  );
}
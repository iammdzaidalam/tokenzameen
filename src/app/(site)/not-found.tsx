import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";

export default function NotFound() {
  return (
    <Section space="xl" tone="darker">
      <Container width="narrow" className="text-center">
        <Eyebrow className="justify-center">404</Eyebrow>
        <h1 className="mt-6 text-display-lg">This address doesn&apos;t exist.</h1>
        <p className="mt-5 text-base leading-relaxed text-steel-300">
          The page you were looking for has moved or was never here. The collection is a
          short one — you will find what you need from the properties index.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/purchase/properties">Explore Properties</Button>
          <Button href="/purchase" variant="secondary">
            Back to Purchase
          </Button>
        </div>
      </Container>
    </Section>
  );
}

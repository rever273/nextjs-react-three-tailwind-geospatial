import { ConceptBanner } from '@/components/ConceptBanner';
import { BackToTop } from '@/components/BackToTop';
import { TechnologySite } from '@/concepts/technology/TechnologySite';

export default function Page() {
  return (
    <>
      <ConceptBanner />
      <div className="concept technology" data-design="technology">
        <TechnologySite />
        <BackToTop />
      </div>
    </>
  );
}

import { LegalPage } from '../src/components/LegalPage';
import { terms } from '../src/data/legal';

export default function Page() {
  return <LegalPage doc={terms} />;
}

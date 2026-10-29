import { LegalPage } from '../src/components/LegalPage';
import { privacy } from '../src/data/legal';

export default function Page() {
  return <LegalPage doc={privacy} />;
}

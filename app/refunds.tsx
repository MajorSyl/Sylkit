import { LegalPage } from '../src/components/LegalPage';
import { refunds } from '../src/data/legal';

export default function Page() {
  return <LegalPage doc={refunds} />;
}

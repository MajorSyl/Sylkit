import { Redirect } from 'expo-router';

// The startups marketplace is paused (code kept in /paused). Old links go to the home page.
export default function Paused() {
  return <Redirect href="/" />;
}

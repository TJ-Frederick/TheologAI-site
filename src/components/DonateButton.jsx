import { Link } from 'react-router-dom';

export default function DonateButton({ className = '' }) {
  return (
    <Link
      to="/donate"
      className={`inline-block rounded-lg bg-gold-500 px-6 py-3 font-semibold text-gray-950 transition-colors hover:bg-gold-400 ${className}`}
    >
      Donate with USDC
    </Link>
  );
}

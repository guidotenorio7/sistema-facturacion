import MenuIcon from './MenuIcon.jsx';
import { useSession } from './Session.jsx';

export default function Head({
  setMenuShowed,
}) {
  const session = useSession();

  return (
    <div className="head">
      <MenuIcon
        onClick={() => setMenuShowed(value => !value)}
      />
      <h1>TUDS - DA - 2025</h1>
      <div className="head-user">
        {session.user?.fullName}
      </div>
    </div>
  );
}
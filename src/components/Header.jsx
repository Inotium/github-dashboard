import UserSearch from './Search';

const Header = () => {
  return (
    <header className="bg-zinc-900 w-full p-2 flex justify-center shadow-md absolute top-0 left-0">
      <div className="w-full max-w-xl">
        <UserSearch />
      </div>
    </header>
  );
};

export default Header;

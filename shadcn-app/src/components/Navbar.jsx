const Navbar = () => {
  return (
    <header className="w-full py-5 sm:px-10 px-5 flex justify-between items-center bg-black color-white">
      <nav className="flex w-full screen-max-width nav-black">
        <img src="" alt="ag logo" />
        <div className="flex flex-1 justify-center">
          <ul className="flex space-x-5">
            <li className="hover:text-white transition-all cursor-pointer">Home</li>
            <li className="hover:text-white transition-all cursor-pointer">About Us</li>
            <li className="hover:text-white transition-all cursor-pointer">Our Services</li>
          </ul>
        </div>
        <div>
        <button className='rounded bg-blue-200 btn'>Contact Us</button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

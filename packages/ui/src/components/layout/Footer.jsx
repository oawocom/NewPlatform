export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>© 2025 Platform. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-gray-700">Help</a>
          <a href="#" className="hover:text-gray-700">Privacy</a>
          <a href="#" className="hover:text-gray-700">Terms</a>
        </div>
      </div>
    </footer>
  );
}
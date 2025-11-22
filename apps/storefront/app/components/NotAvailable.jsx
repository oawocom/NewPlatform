export default function NotAvailable({ subdomain }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Project Not Available
        </h2>
        <p className="text-gray-500 mb-4">
          The subdomain <strong>{subdomain}.buildown.design</strong> does not exist.
        </p>
        <a 
          href="https://account.buildown.design" 
          className="text-blue-600 hover:underline"
        >
          Go to Platform
        </a>
      </div>
    </div>
  );
}

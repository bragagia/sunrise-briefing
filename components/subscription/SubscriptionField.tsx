export default function SubscriptionField({
  className,
}: {
  className: string;
}) {
  return (
    <form className={'w-full max-w ' + className}>
      <div className="flex items-center border-b  text-gray-900 py-2">
        <input
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="email"
          placeholder="i-want-sunrise-briefing@mail.com"
          aria-label="Email"
        />
        <button
          className="flex-shrink-0 bg-gray-900 hover:bg-gray-700 border-gray-900 hover:border-gray-700 text-sm border-4 text-white py-1 px-2 rounded"
          type="button"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}

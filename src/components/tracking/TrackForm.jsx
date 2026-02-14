export default function TrackForm({
  trackingNumber,
  setTrackingNumber,
  loading,
  onSubmit,
  error,
}) {
  return (
    <section className="w-full flex flex-col items-center mt-10 px-4">
      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-bold text-aramexRed mb-6 text-center">
        Track your Shipment
      </h1>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col lg:flex-row gap-3 items-center"
      >
        <div className="w-full">
          <input
            type="text"
            placeholder="Type your tracking number here"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-80 lg:w-[480px] h-14 lg:h-16 px-4 rounded-md shadow-md outline-none border focus:border-aramexRed"
            required
          />
          {error && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-aramexRed hover:bg-red-700 text-white font-medium rounded-md h-14 lg:h-16 px-8 transition"
        >
          {loading ? 'Searching…' : 'Track'}
        </button>
      </form>

      {/* Helper Text */}
      <p className="text-gray-600 text-sm mt-4 text-center max-w-xl">
        Enter multiple tracking numbers with a space or comma.  
        If your tracking number isn’t working, double-check the format.
      </p>
    </section>
  )
}

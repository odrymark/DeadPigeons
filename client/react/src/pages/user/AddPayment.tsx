import { useState } from "react";
import { apiService } from "../../api";

export default function AddPayment() {
    const [paymentNumber, setPaymentNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setError("");

        if (!paymentNumber.trim()) {
            setError("Payment number is required");
            return;
        }

        try {
            setLoading(true);
            await apiService.addPayment({ paymentNumber: paymentNumber.trim() });
            setPaymentNumber("");
        } catch (err) {
            setError("Failed to add payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 min-h-screen">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl font-bold justify-center mb-6">
                        Add Payment
                    </h1>

                    {error && (
                        <div className="alert alert-error shadow-lg mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="fieldset border border-base-300 rounded-lg p-6">
                            <legend className="fieldset-legend text-lg font-semibold px-2">
                                Payment Details
                            </legend>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">
                                            Payment Number
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder="e.g. PAY-2025-001"
                                        value={paymentNumber}
                                        onChange={(e) => setPaymentNumber(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-dots loading-lg"></span>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
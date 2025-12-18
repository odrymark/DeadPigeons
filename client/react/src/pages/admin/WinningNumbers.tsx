import { useState } from "react";
import { apiService } from "../../api";

export default function AddWinningNumbers() {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const maxCount = 3;

    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(prev => prev.filter(n => n !== num));
            return;
        }

        if (selectedNumbers.length < maxCount) {
            setSelectedNumbers(prev => [...prev, num].sort((a, b) => a - b)); // optional: keep sorted
        }
    };

    const handleSubmit = async () => {
        if (selectedNumbers.length !== maxCount) {
            alert("Please select exactly 3 numbers.");
            return;
        }

        try {
            setLoading(true);
            await apiService.addWinningNumbers(selectedNumbers);
            setSelectedNumbers([]);
        } catch (err) {
            alert("Failed to save winning numbers. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const gridNumbers = Array.from({ length: 16 }, (_, i) => i + 1);

    const isSubmitDisabled = selectedNumbers.length !== maxCount || loading;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 min-h-screen">
            <div className="card w-full max-w-lg bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl font-bold justify-center mb-6">
                        Add Weekly Winning Numbers
                    </h1>

                    <fieldset className="fieldset border border-base-300 rounded-lg p-6">
                        <legend className="fieldset-legend text-lg font-semibold px-2">
                            Select 3 Numbers (1–16)
                        </legend>

                        <div className="grid grid-cols-4 gap-3 my-6">
                            {gridNumbers.map(num => {
                                const isSelected = selectedNumbers.includes(num);
                                const isDisabled = !isSelected && selectedNumbers.length >= maxCount;

                                return (
                                    <button
                                        key={num}
                                        className={`
                                            w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold transition-all
                                            ${isSelected
                                            ? "btn btn-primary text-white shadow-lg scale-105"
                                            : "bg-base-200 hover:bg-base-300"
                                        }
                                            ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                        `}
                                        onClick={() => toggleNumber(num)}
                                        disabled={isDisabled}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="text-center text-sm text-base-content/70 mb-4">
                            Selected: <span className="font-bold">{selectedNumbers.join(", ") || "None"}</span>
                            {" "} ({selectedNumbers.length} / {maxCount})
                        </div>
                    </fieldset>

                    <button
                        className="btn btn-primary w-full"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                    >
                        {loading ? (
                            <span className="loading loading-dots loading-lg"></span>
                        ) : (
                            "Submit Winning Numbers"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
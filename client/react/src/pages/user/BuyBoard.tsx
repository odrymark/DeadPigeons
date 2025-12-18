import { useAtom } from "jotai";
import { apiService } from "../../api";
import { useState } from "react";
import { balanceAtom } from "../../atoms/balanceAtom.ts";

export default function BuyBoard() {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [fieldsCount, setFieldsCount] = useState(5);
    const [, setBalance] = useAtom(balanceAtom);

    const [repeatEnabled, setRepeatEnabled] = useState(false);
    const [repeatCount, setRepeatCount] = useState(1);

    const [loading, setLoading] = useState(false);

    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers((prev) => prev.filter((n) => n !== num));
            return;
        }

        if (selectedNumbers.length < fieldsCount) {
            setSelectedNumbers((prev) => [...prev, num].sort((a, b) => a - b));
        }
    };

    const handleSubmit = async () => {
        if (selectedNumbers.length !== fieldsCount) {
            alert(`Please select exactly ${fieldsCount} numbers`);
            return;
        }

        if (repeatEnabled && repeatCount < 1) {
            alert("Repeat count must be at least 1");
            return;
        }

        try {
            setLoading(true);
            await apiService.addBoard({
                numbers: selectedNumbers,
                repeats: repeatEnabled ? repeatCount : 0,
            });

            const balance = await apiService.getBalance();
            setBalance(balance);

            setSelectedNumbers([]);
            setRepeatEnabled(false);
            setRepeatCount(1);
        } catch (err) {
            alert("Failed to submit board. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const gridNumbers = Array.from({ length: 16 }, (_, i) => i + 1);

    const isSubmitDisabled = selectedNumbers.length !== fieldsCount || loading;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 min-h-screen">
            <div className="card w-full max-w-lg bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl font-bold justify-center mb-6">
                        Buy Lottery Board
                    </h1>

                    <fieldset className="fieldset border border-base-300 rounded-lg p-6">
                        <legend className="fieldset-legend text-lg font-semibold px-2">
                            Select Your Numbers (1–16)
                        </legend>

                        <div className="grid grid-cols-4 gap-4 my-8">
                            {gridNumbers.map((num) => {
                                const isSelected = selectedNumbers.includes(num);
                                const isDisabled = !isSelected && selectedNumbers.length >= fieldsCount;

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

                        <div className="text-center text-sm text-base-content/70 mb-6">
                            Selected: <span className="font-bold">
                                {selectedNumbers.join(", ") || "None"}
                            </span>{" "}
                            ({selectedNumbers.length} / {fieldsCount})
                        </div>

                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-medium">Number of fields per board</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={fieldsCount}
                                onChange={(e) => {
                                    const newCount = Number(e.target.value);
                                    setFieldsCount(newCount);
                                    if (selectedNumbers.length > newCount) {
                                        setSelectedNumbers((prev) => prev.slice(0, newCount));
                                    }
                                }}
                            >
                                {[5, 6, 7, 8].map((n) => (
                                    <option key={n} value={n}>
                                        {n} fields
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control mb-6">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary toggle-lg"
                                    checked={repeatEnabled}
                                    onChange={(e) => setRepeatEnabled(e.target.checked)}
                                />
                                <span className="label-text font-medium">
                                    Repeat board for multiple weeks
                                </span>
                            </label>

                            {repeatEnabled && (
                                <div className="mt-4">
                                    <label className="label">
                                        <span className="label-text font-medium">Number of weeks</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="input input-bordered w-full text-center"
                                        value={repeatCount}
                                        onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value)))}
                                    />
                                </div>
                            )}
                        </div>
                    </fieldset>

                    <button
                        className="btn btn-primary w-full text-lg"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                    >
                        {loading ? (
                            <span className="loading loading-dots loading-lg"></span>
                        ) : (
                            "Submit Board"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
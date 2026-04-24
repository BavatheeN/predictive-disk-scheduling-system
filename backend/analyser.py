import numpy as np
from scipy.optimize import curve_fit


def fit_complexity(T_n: list[int]) -> dict:
    if len(T_n) < 3:
        return {"best_fit": "O(n)", "r2_score": 1.0}

    n = np.arange(1, len(T_n))
    y = np.array(T_n[1:], dtype=float)

    models = {
        "O(n)": lambda x, a: a * x,
        "O(n log n)": lambda x, a: a * x * np.log(x + 1),
        "O(n^2)": lambda x, a: a * x**2,
        "O(sqrt n)": lambda x, a: a * np.sqrt(x),
    }

    ss_tot = np.sum((y - np.mean(y)) ** 2)
    if ss_tot == 0:
        return {"best_fit": "O(n)", "r2_score": 1.0}

    best_name = "O(n)"
    best_r2 = float("-inf")

    for name, model in models.items():
        try:
            params, _ = curve_fit(model, n, y, maxfev=10000)
            y_pred = model(n, *params)
            ss_res = np.sum((y - y_pred) ** 2)
            r2 = 1 - (ss_res / ss_tot)
            if r2 > best_r2:
                best_r2 = float(r2)
                best_name = name
        except Exception:
            continue

    if best_r2 == float("-inf"):
        return {"best_fit": "O(n)", "r2_score": 0.0}

    return {"best_fit": best_name, "r2_score": round(best_r2, 4)}


def theoretical_bounds() -> list[dict]:
    return [
        {"algo": "FCFS", "best": "O(n)", "avg": "O(n*D)", "worst": "O(n*D)"},
        {"algo": "SCAN", "best": "O(n)", "avg": "O(sqrt n)", "worst": "O(n)"},
        {"algo": "CSCAN", "best": "O(n)", "avg": "O(sqrt n)", "worst": "O(n)"},
        {
            "algo": "PREDICTIVE",
            "best": "O(n)",
            "avg": "O(n log n)",
            "worst": "O(n^2)",
        },
    ]


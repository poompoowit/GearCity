# Contributing to GearCity Calculation Suite

Thank you for your interest in improving the GearCity Calculation Suite!

## 🛠️ Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/GearCity.git
   cd GearCity
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -e .
   ```

## 🧪 Running Tests

Always run the full test suite before submitting a pull request:

```bash
python -m unittest discover tests
```

To run the parity verification against original game calculations:
```bash
python -m unittest tests/test_notebook_parity.py
```

## 📝 Code Guidelines

- **Type Hints**: Use standard Python type hints for all public functions and methods.
- **Pure Math Modules**: Keep calculation logic in `gearcity/engine_calculator.py` decoupled from I/O and CLI presentation.
- **Documentation**: Update docstrings and `README.md` whenever new features or CLI flags are added.

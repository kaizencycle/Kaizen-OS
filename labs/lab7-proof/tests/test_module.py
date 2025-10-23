# tests/test_module.py
import importlib
import pathlib

def test_generated_module_exists():
    assert pathlib.Path("module.py").exists()

def test_value_constant_is_reasonable():
    m = importlib.import_module("module")
    assert hasattr(m, "VALUE")
    assert isinstance(m.VALUE, int)
    assert 0 <= m.VALUE <= 10_000
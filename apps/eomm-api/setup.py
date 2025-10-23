from setuptools import setup, find_packages

with open("requirements.txt", "r") as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]

setup(
    name="lab4-proof-api",
    version="0.12.0",
    packages=find_packages(),
    install_requires=requirements,
    python_requires=">=3.11",
)

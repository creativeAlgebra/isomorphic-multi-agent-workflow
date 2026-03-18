from setuptools import setup, find_packages

setup(
    name="imaw",
    version="0.1.0",
    description="Isomorphic Multi-Agent Workflows: Enterprise logic translation engine.",
    author="Randall Garcia",
    packages=find_packages(),
    install_requires=[
        "google-genai",
        "pydantic"
    ],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.10",
    ],
)

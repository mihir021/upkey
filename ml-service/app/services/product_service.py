import pandas as pd
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class ProductService:
    def __init__(self, data_path: str = "data/joyory_products.csv"):
        self.data_path = data_path
        self.df = pd.DataFrame()
        self.load_data()

    def load_data(self):
        try:
            self.df = pd.read_csv(self.data_path)
            self.df.fillna("", inplace=True)
            print(f"SUCCESS: Loaded {len(self.df)} products from {self.data_path}.")
            print(f"COLUMNS DETECTED: {list(self.df.columns)}")
        except Exception as e:
            error_msg = f"STARTUP ERROR: Failed to load product dataset from {self.data_path}. Exception: {e}"
            print(error_msg)
            raise RuntimeError(error_msg)

    def get_all_products(self) -> List[Dict[str, Any]]:
        if self.df.empty:
            return []
        return self.df.to_dict(orient="records")

    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        if self.df.empty:
            return None
        
        if 'id' in self.df.columns:
            matches = self.df[self.df['id'].astype(str) == str(product_id)]
            if not matches.empty:
                return matches.iloc[0].to_dict()
        return None

    def search_products(self, query: str) -> List[Dict[str, Any]]:
        if self.df.empty or not query:
            return self.get_all_products()

        query = query.lower()
        searchable_columns = ['name', 'brand', 'category', 'concerns', 'key_ingredients', 'skin_type', 'skin_tone']
        
        # Only search in columns that actually exist in the dataframe
        valid_columns = [col for col in searchable_columns if col in self.df.columns]
        
        if not valid_columns:
            return []

        # Create a boolean mask for rows that match the query in any valid column
        mask = self.df[valid_columns].apply(lambda row: row.astype(str).str.lower().str.contains(query).any(), axis=1)
        matches = self.df[mask]
        
        return matches.to_dict(orient="records")

# Singleton instance
product_service = ProductService()

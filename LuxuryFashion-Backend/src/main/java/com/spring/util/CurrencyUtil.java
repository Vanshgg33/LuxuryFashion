package com.spring.util;

/**
 * Utility class for currency-related operations
 */
public class CurrencyUtil {
    
    public static final String CURRENCY_CODE = "INR";
    public static final String CURRENCY_SYMBOL = "₹";
    public static final String CURRENCY_NAME = "Rupees";
    
    /**
     * Format amount with currency symbol
     * @param amount the amount to format
     * @return formatted string like "₹1,234.56"
     */
    public static String formatAmount(Double amount) {
        if (amount == null) {
            return CURRENCY_SYMBOL + "0.00";
        }
        return CURRENCY_SYMBOL + String.format("%.2f", amount);
    }
    
    /**
     * Format amount with currency code
     * @param amount the amount to format
     * @return formatted string like "1,234.56 INR"
     */
    public static String formatAmountWithCode(Double amount) {
        if (amount == null) {
            return "0.00 " + CURRENCY_CODE;
        }
        return String.format("%.2f %s", amount, CURRENCY_CODE);
    }
    
    /**
     * Get currency information as a map
     * @return map with currency code, symbol, and name
     */
    public static java.util.Map<String, String> getCurrencyInfo() {
        java.util.Map<String, String> currencyInfo = new java.util.HashMap<>();
        currencyInfo.put("code", CURRENCY_CODE);
        currencyInfo.put("symbol", CURRENCY_SYMBOL);
        currencyInfo.put("name", CURRENCY_NAME);
        return currencyInfo;
    }
}






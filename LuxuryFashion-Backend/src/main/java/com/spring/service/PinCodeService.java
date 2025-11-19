package com.spring.service;

import java.util.Map;

public interface PinCodeService {
    /**
     * Get city and state from pin code
     * @param pinCode the pin code (postal code)
     * @return Map containing city and state, or null if not found
     */
    Map<String, String> getCityAndStateFromPinCode(String pinCode);
    
    /**
     * Validate pin code format (for India: 6 digits)
     * @param pinCode the pin code to validate
     * @return true if valid format
     */
    boolean isValidPinCode(String pinCode);
}






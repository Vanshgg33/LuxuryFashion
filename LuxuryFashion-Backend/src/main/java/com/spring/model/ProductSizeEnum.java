package com.spring.model;

public enum ProductSizeEnum {
    XS("XS"),
    S("S"),
    M("M"),
    L("L"),
    XL("XL"),
    XXL("XXL"),
    XXXL("XXXL"),
    SIZE_28("28"),
    SIZE_30("30"),
    SIZE_32("32"),
    SIZE_34("34"),
    SIZE_36("36"),
    SIZE_38("38"),
    SIZE_40("40"),
    SIZE_42("42"),
    SIZE_44("44"),
    SIZE_46("46"),
    SIZE_48("48"),
    SIZE_50("50"),
    SIZE_52("52"),
    ONE_SIZE("One Size");

    private final String value;

    ProductSizeEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ProductSizeEnum fromString(String value) {
        for (ProductSizeEnum size : ProductSizeEnum.values()) {
            if (size.value.equalsIgnoreCase(value)) {
                return size;
            }
        }
        return null;
    }

    public static boolean isValidSize(String value) {
        return fromString(value) != null;
    }
}









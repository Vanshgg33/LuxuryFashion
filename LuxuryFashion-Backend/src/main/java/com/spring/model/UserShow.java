package com.spring.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserShow implements UserDetails {
    private final User user;

    public UserShow(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(); // Empty authorities, update if needed
    }

    @Override
    public String getPassword() {
        return user.getPassword(); // ✅ call user object
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // ✅ call user object
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // customize as per your logic
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // customize as per your logic
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // customize as per your logic
    }

    @Override
    public boolean isEnabled() {
        return true; // customize as per your logic
    }
}

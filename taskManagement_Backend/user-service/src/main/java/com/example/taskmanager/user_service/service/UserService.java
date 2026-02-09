package com.example.taskmanager.user_service.service;

import com.example.taskmanager.user_service.model.Role;
import com.example.taskmanager.user_service.model.User;
import com.example.taskmanager.user_service.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;



@Service
public class UserService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;

    public UserService(UserRepository repo, BCryptPasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    // 🔐 SIGNUP → ALWAYS MEMBER
    public User signup(String name, String email, String rawPassword) {

        if (repo.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User u = new User();
        u.setFirstName(name);
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setIsActive(true);

        // 🔐 FORCE ROLE (ignore any input role)
        u.setRole(Role.MEMBER);

        return repo.save(u);
    }

    public Optional<User> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    public boolean checkPassword(User user, String rawPassword) {
        return encoder.matches(rawPassword, user.getPasswordHash());
    }

    public Optional<User> findById(Long id) {
        return repo.findById(id);
    }

    public User save(User user) {
        return repo.save(user);
    }

    public void updatePassword(User user, String newPassword) {
        user.setPasswordHash(encoder.encode(newPassword));
        repo.save(user);
    }
}

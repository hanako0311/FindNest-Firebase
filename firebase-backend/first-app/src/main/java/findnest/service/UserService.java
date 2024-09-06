package findnest.service;

import findnest.model.User;
import java.util.List;

public interface UserService {
    User createUser(User user);
    User getUserById(String id);
    List<User> getAllUsers();
    User updateUser(User user);
    void deleteUser(String id);
    int getUserCount();
    void updateProfilePicture(String id, String profilePictureUrl);
}

package com.tucasa.mabibo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    @Value("${app.storage.profiles-dir:uploads/profiles}")
    private String profilesDir;

    @Value("${app.storage.profile-pic.max-size-mb:2}")
    private int maxSizeMb;

    @Value("${app.storage.profile-pic.allowed-types:image/jpeg}")
    private String allowedTypes;

    @Value("${app.storage.profile-pic.target-ratio:3:4}")
    private String targetRatio;

    public String storeProfilePicture(MultipartFile file, Long userId) throws IOException {
        validateFile(file);

        String filename = UUID.randomUUID() + ".jpg";
        Path targetPath = Paths.get(profilesDir).resolve(filename);

        Files.createDirectories(targetPath.getParent());

        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        if (originalImage == null) {
            throw new IllegalArgumentException("Invalid image file");
        }

        BufferedImage processedImage = cropToRatio(originalImage);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(processedImage, "jpg", baos);
            try (InputStream is = new ByteArrayInputStream(baos.toByteArray())) {
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        }

        log.info("Stored profile picture for user {}: {}", userId, filename);
        return "/api/files/profiles/" + filename;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxSizeMb * 1024L * 1024L) {
            throw new IllegalArgumentException("File size exceeds maximum of " + maxSizeMb + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG images are allowed");
        }
    }

    private BufferedImage cropToRatio(BufferedImage image) {
        int targetWidth;
        int targetHeight;
        String[] parts = targetRatio.split(":");
        double targetAspectRatio = Double.parseDouble(parts[0]) / Double.parseDouble(parts[1]);

        int originalWidth = image.getWidth();
        int originalHeight = image.getHeight();
        double originalAspectRatio = (double) originalWidth / originalHeight;

        if (originalAspectRatio > targetAspectRatio) {
            targetHeight = originalHeight;
            targetWidth = (int) (targetHeight * targetAspectRatio);
        } else {
            targetWidth = originalWidth;
            targetHeight = (int) (targetWidth / targetAspectRatio);
        }

        int x = (originalWidth - targetWidth) / 2;
        int y = (originalHeight - targetHeight) / 2;

        return image.getSubimage(x, y, targetWidth, targetHeight);
    }

    public Path getProfilePicturePath(String filename) {
        return Paths.get(profilesDir).resolve(filename).normalize();
    }

    public void deleteProfilePicture(String filename) throws IOException {
        Path path = getProfilePicturePath(filename);
        Files.deleteIfExists(path);
    }
}
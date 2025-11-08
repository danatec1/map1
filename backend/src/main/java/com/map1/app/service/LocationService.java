package com.map1.app.service;

import com.map1.app.model.Location;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class LocationService {
    private final List<Location> locations = new ArrayList<>();
    private Long nextId = 1L;

    public LocationService() {
        // Initialize with some sample locations
        locations.add(new Location(nextId++, "Seoul Tower", 37.5512, 126.9882, "Famous landmark in Seoul"));
        locations.add(new Location(nextId++, "Gangnam Station", 37.4979, 127.0276, "Busy metro station"));
        locations.add(new Location(nextId++, "Gyeongbokgung Palace", 37.5788, 126.9770, "Historic palace"));
    }

    public List<Location> getAllLocations() {
        return new ArrayList<>(locations);
    }

    public Optional<Location> getLocationById(Long id) {
        return locations.stream()
                .filter(loc -> loc.getId().equals(id))
                .findFirst();
    }

    public Location addLocation(Location location) {
        location.setId(nextId++);
        locations.add(location);
        return location;
    }

    public boolean deleteLocation(Long id) {
        return locations.removeIf(loc -> loc.getId().equals(id));
    }
}

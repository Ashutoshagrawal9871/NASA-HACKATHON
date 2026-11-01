// solar_system.cpp
// Animated solar system simulation using SFML
// Single-file C++ program. Draws a sun and multiple orbiting planets with
// adjustable speeds, zoom, pan, and trails.

#include <SFML/Graphics.hpp>
#include <vector>
#include <cmath>
#include <string>

struct Planet {
    float radius;        // visual radius
    float distance;      // distance from center (orbit radius)
    float angularSpeed;  // radians per second
    float angle;         // current angle position
    sf::Color color;
    float eccentricity;  // for elliptical orbits (0 = circle)
    bool showTrail;
    std::vector<sf::Vertex> trail;
};

int main() {
    const unsigned int WIN_W = 1200;
    const unsigned int WIN_H = 800;

    sf::RenderWindow window(sf::VideoMode(WIN_W, WIN_H), "Solar System - SFML");
    window.setFramerateLimit(120);

    // View (for zoom & pan)
    sf::View view(sf::FloatRect(0, 0, (float)WIN_W, (float)WIN_H));
    sf::Vector2f center(WIN_W / 2.f, WIN_H / 2.f);
    view.setCenter(center);

    // Sun
    sf::CircleShape sun(40.f);
    sun.setOrigin(sun.getRadius(), sun.getRadius());
    sun.setPosition(center);
    sun.setFillColor(sf::Color(255, 200, 30));
    sun.setOutlineThickness(2.f);
    sun.setOutlineColor(sf::Color(255, 150, 0));

    // Planets list (radius, distance, speed, initial angle, color, eccentricity)
    std::vector<Planet> planets = {
        {6.f, 80.f,  1.6f,  0.0f, sf::Color(150,150,255), 0.02f, true, {}}, // Mercury-style
        {9.f, 130.f, 1.0f,  1.5f, sf::Color(200,120,60),  0.03f, true, {}}, // Venus-style
        {10.f, 190.f, 0.85f, 2.8f, sf::Color(100,160,100), 0.01f, true, {}}, // Earth-style
        {5.f, 240.f, 0.45f, 3.5f, sf::Color(200,100,200), 0.05f, true, {}}, // Mars-style
        {20.f, 320.f, 0.12f, 0.8f, sf::Color(200,180,120), 0.02f, true, {}}, // Jupiter-style
        {16.f, 400.f, 0.08f, 1.2f, sf::Color(180,160,210), 0.04f, true, {}}, // Saturn-style
        {14.f, 480.f, 0.05f, 2.6f, sf::Color(120,180,220), 0.06f, true, {}}, // Uranus-style
        {13.f, 540.f, 0.03f, 4.0f, sf::Color(80,150,200),  0.08f, true, {}}, // Neptune-style
    };

    // Pre-create shapes for planets
    std::vector<sf::CircleShape> shapes; shapes.reserve(planets.size());
    for (auto &p : planets) {
        sf::CircleShape c(p.radius);
        c.setOrigin(p.radius, p.radius);
        c.setFillColor(p.color);
        c.setOutlineThickness(1.f);
        c.setOutlineColor(sf::Color::Black);
        shapes.push_back(c);
    }

    // Orbit draw parameters
    sf::VertexArray orbitLines(sf::Lines);

    // Control variables
    bool paused = false;
    float globalSpeed = 1.0f; // multiplier
    float zoom = 1.0f;
    const float zoomFactor = 1.1f;
    bool showOrbits = true;
    bool showTrails = true;

    sf::Clock clock;
    float accum = 0.f;

    while (window.isOpen()) {
        sf::Event ev;
        while (window.pollEvent(ev)) {
            if (ev.type == sf::Event::Closed) window.close();
            else if (ev.type == sf::Event::KeyPressed) {
                if (ev.key.code == sf::Keyboard::Space) paused = !paused;
                else if (ev.key.code == sf::Keyboard::Add || ev.key.code == sf::Keyboard::Equal) globalSpeed *= 1.25f;
                else if (ev.key.code == sf::Keyboard::Subtract || ev.key.code == sf::Keyboard::Hyphen) globalSpeed /= 1.25f;
                else if (ev.key.code == sf::Keyboard::O) showOrbits = !showOrbits;
                else if (ev.key.code == sf::Keyboard::T) showTrails = !showTrails;
                else if (ev.key.code == sf::Keyboard::R) { // reset view
                    zoom = 1.0f; view.setSize((float)WIN_W, (float)WIN_H); view.setCenter(center);
                }
            } else if (ev.type == sf::Event::MouseWheelScrolled) {
                if (ev.mouseWheelScroll.delta > 0) { zoom /= zoomFactor; view.zoom(1.f/zoomFactor); }
                else { zoom *= zoomFactor; view.zoom(zoomFactor); }
            } else if (ev.type == sf::Event::MouseButtonPressed) {
                if (ev.mouseButton.button == sf::Mouse::Right) { // move center to mouse
                    sf::Vector2i m = sf::Mouse::getPosition(window);
                    sf::Vector2f worldPos = window.mapPixelToCoords(m, view);
                    view.setCenter(worldPos);
                }
            } else if (ev.type == sf::Event::Resized) {
                // keep aspect
                sf::FloatRect visibleArea(0, 0, (float)ev.size.width, (float)ev.size.height);
                view.setSize(visibleArea.width, visibleArea.height);
            }
        }

        float dt = clock.restart().asSeconds();
        if (!paused) accum += dt;

        // Update planets
        for (size_t i = 0; i < planets.size(); ++i) {
            Planet &p = planets[i];
            if (!paused) p.angle += dt * p.angularSpeed * globalSpeed;

            float a = p.angle;
            // elliptical: x = distance * cos(t), y = distance*(1 - e) * sin(t)
            float ex = p.distance * std::cos(a);
            float ey = p.distance * (1.f - p.eccentricity) * std::sin(a);
            sf::Vector2f pos = center + sf::Vector2f(ex, ey);

            // update trail
            if (showTrails && p.showTrail) {
                // append point every few frames
                if (p.trail.empty() || (p.trail.back().position - pos).x*p.trail.back().position - pos.y) {
                    // simple decimation: push when far enough
                }
                // we'll push every frame but limit length
                p.trail.push_back(sf::Vertex(pos, sf::Color(p.color.r/2, p.color.g/2, p.color.b/2)));
                if (p.trail.size() > 600) p.trail.erase(p.trail.begin());
            } else {
                p.trail.clear();
            }

            shapes[i].setPosition(pos);
        }

        // DRAW
        window.clear(sf::Color(10,10,20));
        window.setView(view);

        // draw orbits
        if (showOrbits) {
            for (const Planet &p : planets) {
                // draw orbit as thin circle (ellipse)
                sf::CircleShape orbit(p.distance);
                orbit.setOrigin(p.distance, p.distance);
                orbit.setPosition(center);
                orbit.setFillColor(sf::Color::Transparent);
                orbit.setOutlineThickness(1.f);
                orbit.setOutlineColor(sf::Color(80,80,80,100));
                // scale y for eccentricity
                orbit.setScale(1.f, 1.f - p.eccentricity);
                window.draw(orbit);
            }
        }

        // draw trails (behind planets)
        if (showTrails) {
            for (const Planet &p : planets) {
                if (p.trail.size() < 2) continue;
                sf::VertexArray va(sf::LineStrip, p.trail.size());
                for (size_t i = 0; i < p.trail.size(); ++i) va[i] = p.trail[i];
                window.draw(va);
            }
        }

        // draw sun
        window.draw(sun);

        // draw planets
        for (const auto &c : shapes) window.draw(c);

        // HUD (draw in screen coords) - info overlay
        window.setView(window.getDefaultView());
        sf::Font font;
        static bool fontLoaded = false;
        if (!fontLoaded) {
            // try to load a default font from OS; fall back will be no text if it fails
            if (!font.loadFromFile("C:/Windows/Fonts/arial.ttf")) {
                fontLoaded = false; // keep false
            } else fontLoaded = true;
        }

        if (fontLoaded) {
            sf::Text info;
            info.setFont(font);
            info.setCharacterSize(14);
            info.setFillColor(sf::Color::White);
            info.setPosition(8.f, 8.f);
            info.setString("Space: pause | +/-: speed | Mouse wheel: zoom | Right-click: pan to mouse | O: toggle orbits | T: toggle trails | R: reset view");
            window.draw(info);

            sf::Text stats;
            stats.setFont(font);
            stats.setCharacterSize(14);
            stats.setFillColor(sf::Color::White);
            stats.setPosition(8.f, 28.f);
            stats.setString("Speed x" + std::to_string((int)(globalSpeed*100))/100.0f);
            window.draw(stats);
        }

        window.display();
    }

    return 0;
}

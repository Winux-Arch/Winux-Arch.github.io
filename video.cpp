#include <opencv2/opencv.hpp>
#include <vector>
#include <cstdlib>
#include <ctime>

// Wave parameters
const int width = 800;
const int height = 800;
const float damping = 0.99;
const int ball_radius = width / 10;
const int num_frames = 10000; // Number of frames

// Ball position
const int ball_x = width / 2;
const int ball_y = height / 2;

// Function to check if a point is inside the ball
bool isInBall(int x, int y) {
    int dx = x - ball_x;
    int dy = y - ball_y;
    return dx * dx + dy * dy <= ball_radius * ball_radius;
}

// Function to initialize the wave with a single disturbance at a random position
void initializeWave(std::vector<std::vector<float>>& wavePrevious) {
    int randomX = std::rand() % width;
    int randomY = std::rand() % height;
    wavePrevious[randomX][randomY] = 1000.0f; // Initial disturbance
}

// Function to reset the wave grids
void resetWaves(std::vector<std::vector<float>>& waveCurrent, std::vector<std::vector<float>>& wavePrevious) {
    for (int x = 0; x < width; ++x) {
        for (int y = 0; y < height; ++y) {
            waveCurrent[x][y] = 0.0f;
            wavePrevious[x][y] = 0.0f;
        }
    }
}

// Function to update the wave based on the PDE
void updateWave(std::vector<std::vector<float>>& waveCurrent, std::vector<std::vector<float>>& wavePrevious) {
    std::vector<std::vector<float>> newWave = waveCurrent;
    for (int x = 1; x < width - 1; ++x) {
        for (int y = 1; y < height - 1; ++y) {
            if (!isInBall(x, y)) {
                newWave[x][y] = (
                    wavePrevious[x - 1][y] +
                    wavePrevious[x + 1][y] +
                    wavePrevious[x][y - 1] +
                    wavePrevious[x][y + 1]
                ) / 2 - waveCurrent[x][y];
                newWave[x][y] *= damping;
            } else {
                newWave[x][y] = 0.0f;
            }
        }
    }
    wavePrevious.swap(waveCurrent);
    waveCurrent.swap(newWave);
}

int main() {
    std::srand(std::time(0)); // Seed for random number generation

    // Create the grids
    std::vector<std::vector<float>> waveCurrent(width, std::vector<float>(height, 0.0f));
    std::vector<std::vector<float>> wavePrevious(width, std::vector<float>(height, 0.0f));

    // Initialize the wave
    initializeWave(wavePrevious);

    // Create a video writer
    cv::VideoWriter video("wave_simulation.avi", cv::VideoWriter::fourcc('M','J','P','G'), 10, cv::Size(width, height));

    for (int frame = 0; frame < num_frames; ++frame) {
        updateWave(waveCurrent, wavePrevious);

        // Create an image to draw the wave
        cv::Mat img(height, width, CV_8UC3, cv::Scalar(0, 0, 0));

        for (int x = 0; x < width; ++x) {
            for (int y = 0; y < height; ++y) {
                int brightness = std::min(255, std::max(0, static_cast<int>(waveCurrent[x][y] * 255.0f)));
                if (isInBall(x, y)) {
                    img.at<cv::Vec3b>(y, x) = cv::Vec3b(0, 0, 0);
                } else {
                    img.at<cv::Vec3b>(y, x) = cv::Vec3b(brightness, brightness, 255);
                }
            }
        }

        video.write(img);

        if (frame % 100 == 0) {
            std::cout << "Frame: " << frame << std::endl;
        }
    }

    video.release();
    std::cout << "Video saved as wave_simulation.avi" << std::endl;

    return 0;
}


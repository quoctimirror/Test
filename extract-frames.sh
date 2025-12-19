#!/bin/bash

# Script to extract frames from video for smooth canvas sequence animation

INPUT_VIDEO="public/home-page/Landscape_3D.mp4"
OUTPUT_DIR="public/home-page/frames"
FRAME_RATE=30  # Extract 30 frames per second for smooth animation (10s video = 300 frames)

echo "=== Video Frame Extraction ==="
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed. Please install it first:"
    echo "   Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "   MacOS: brew install ffmpeg"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_VIDEO" ]; then
    echo "❌ Input video not found: $INPUT_VIDEO"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📊 Video info:"
ffprobe -v quiet -select_streams v:0 -show_entries stream=duration,nb_frames,avg_frame_rate -of csv=p=0 "$INPUT_VIDEO"
echo ""

echo "🎬 Extracting frames..."
echo "   Frame rate: $FRAME_RATE fps"
echo "   Output: $OUTPUT_DIR"
echo ""

# Extract frames with specific naming pattern
# -vf fps=$FRAME_RATE: extract at specified frame rate
# -q:v 2: high quality (1-5, lower = better)
ffmpeg -i "$INPUT_VIDEO" \
    -vf "fps=$FRAME_RATE,scale=1920:1080" \
    -q:v 2 \
    "$OUTPUT_DIR/frame_%04d.jpg" \
    -y

if [ $? -eq 0 ]; then
    FRAME_COUNT=$(ls -1 "$OUTPUT_DIR"/frame_*.jpg 2>/dev/null | wc -l)
    echo ""
    echo "✅ Frame extraction complete!"
    echo "   Total frames: $FRAME_COUNT"
    echo "   Location: $OUTPUT_DIR"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update MirrorIntroduce component with numFrames=$FRAME_COUNT"
    echo "   2. Test the canvas sequence animation"
    echo ""
    echo "💡 Optimization tips:"
    echo "   - Increase FRAME_RATE for smoother animation (more files)"
    echo "   - Decrease FRAME_RATE for smaller size (less smooth)"
    echo "   - Adjust scale for different resolutions"
else
    echo ""
    echo "❌ Frame extraction failed. Check the error messages above."
    exit 1
fi
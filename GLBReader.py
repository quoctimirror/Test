from pygltflib import GLTF2, Scene, Node, Mesh, Buffer, BufferView, Accessor
import trimesh
import os

def read_and_split_glb(file_path, output_dir="output_meshes"):
    print(f"Đọc file: {file_path}")

    # Load bằng Trimesh (dễ tách lưới)
    scene = trimesh.load(file_path, force='scene')
    
    # Tạo thư mục chứa output nếu chưa có
    os.makedirs(output_dir, exist_ok=True)

    # Lặp qua từng mesh
    for i, (name, mesh) in enumerate(scene.geometry.items()):
        mesh_name = name if name else f"mesh_{i}"
        filename = f"{mesh_name}.glb"
        export_path = os.path.join(output_dir, filename)

        print(f"\n✂️ Xuất mesh [{mesh_name}] thành file: {export_path}")

        # Lưu mesh dưới dạng scene riêng biệt
        sub_scene = trimesh.Scene()
        sub_scene.add_geometry(mesh, node_name=mesh_name)

        # Xuất ra file glb
        sub_scene.export(export_path)

    print("\n✅ Hoàn tất tách mesh.")

# --- Gọi hàm với đường dẫn file GLB của bạn ---
read_and_split_glb("./cryring.glb")  # Thay bằng tên thật, ví dụ: ring.glb

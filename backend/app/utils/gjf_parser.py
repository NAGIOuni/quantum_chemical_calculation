def parse_gjf(content: str):
    lines = content.strip().splitlines()

    # Gaussianキーワードやタイトル行をスキップし、空行2つの後に現れる
    sections = []
    current = []
    for line in lines:
        if not line.strip():
            if current:
                sections.append(current)
                current = []
        else:
            current.append(line)
    if current:
        sections.append(current)

    if len(sections) < 3:
        raise ValueError("GJFファイル形式が不正です（セクション数不足）")

    # 電荷・多重度
    charge_line = sections[2][0].split()
    if len(charge_line) != 2:
        raise ValueError("電荷・スピン多重度の行が不正です")
    charge, multiplicity = map(int, charge_line)

    # 構造（XYZ）行
    structure_xyz = "\n".join(sections[2][1:])

    return {
        "charge": charge,
        "multiplicity": multiplicity,
        "structure_xyz": structure_xyz,
    }

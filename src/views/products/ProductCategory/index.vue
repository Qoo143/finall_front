<template>
  <div class="category-management">
    <div class="title">
      <div class="titleName">分類管理</div>
    </div>

    <div class="line"></div>

    <!-- 搜索區域 -->
    <div class="searchArea">
      <el-input
        v-model="searchName"
        placeholder="請輸入分類名稱"
        class="search-input"
      />
      <el-button @click="handleReset" class="resetBtn">重設</el-button>
      <el-button @click="openAddDialog" type="primary">新增分類</el-button>
    </div>

    <!-- 分類列表 -->
    <div class="listArea">
      <table style="border: none">
        <colgroup>
          <col style="width: 50px" />
          <!-- 筆數 -->
          <col style="width: 200px" />
          <!-- 名稱 -->
          <col style="width: 200px" />
          <!-- 父分類 -->
          <col style="width: 250px" />
          <!-- 描述 -->
          <col style="width: 120px" />
          <!-- 創建時間 -->
          <col style="width: 120px" />
          <!-- 操作 -->
        </colgroup>
        <thead>
          <tr>
            <th>筆數</th>
            <th>分類名稱</th>
            <th>父分類</th>
            <th>描述</th>
            <th>創建時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(category, index) in displayCategories"
            :key="category.id"
            :class="{
              gray: index % 2 === 1,
              'hover-effect-d': index % 2 === 1,
              'hover-effect-l': index % 2 === 0,
            }"
          >
            <td>{{ calculateIndex(index) }}</td>
            <td>{{ category.name }}</td>
            <td>{{ getParentCategoryName(category.parent_id) }}</td>
            <td class="description-cell">{{ category.description || "-" }}</td>
            <td>{{ formatDate(category.created_time) }}</td>
            <td>
              <span class="edit-btn" @click="openEditDialog(category)"
                >編輯</span
              >
              |
              <span
                class="delete-btn"
                @click="openDelete(category.id, category.name)"
                >刪除</span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <div class="pageNation">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="filteredCategories.length"
        @current-change="handlePageChange"
        background
      />
    </div>

    <!-- 新增/編輯對話框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="isEdit ? '編輯分類' : '新增分類'"
      width="500"
      align-center
    >
      <el-form :model="categoryForm" label-width="100px">
        <el-form-item label="分類名稱" required>
          <el-input v-model="categoryForm.name" placeholder="請輸入分類名稱" />
        </el-form-item>
        <el-form-item label="父分類">
          <el-select
            v-model="categoryForm.parent_id"
            placeholder="請選擇父分類"
            clearable
            :disabled="isEdit && hasChildren(categoryForm.id)"
          >
            <el-option label="無 (頂級分類)" :value="0" />
            <el-option
              v-for="item in parentCategoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="item.id === categoryForm.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分類描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            placeholder="請輸入分類描述"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryDialogVisible = false" class="cancel"
            >取消</el-button
          >
          <el-button type="primary" @click="submitCategoryForm">確認</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 刪除確認對話框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="刪除確認"
      width="500"
      align-center
    >
      <span>確定要刪除分類「{{ selectedCategoryName }}」嗎？</span>
      <template v-if="hasChildren(selectedCategoryId)">
        <div class="warning-message">
          <el-alert
            title="此分類有子分類，請先移除子分類後再刪除"
            type="warning"
            :closable="false"
          />
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false" class="cancel"
            >取消</el-button
          >
          <el-button
            type="danger"
            @click="confirmDelete"
            :disabled="hasChildren(selectedCategoryId)"
            >刪除</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Search, Plus } from "@element-plus/icons-vue";

// 定義分類介面
interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number;
  icon_url: string | null;
  created_time: string;
  update_time: string;
}

// 狀態變數
const categories = ref<Category[]>([]); // 所有分類
const searchName = ref(""); // 搜索關鍵字
const loading = ref(false); // 載入狀態

// 分頁相關
const currentPage = ref(1);
const pageSize = ref(10);

// 刪除對話框相關
const deleteDialogVisible = ref(false);
const selectedCategoryId = ref<number | null>(null);
const selectedCategoryName = ref("");

// 新增/編輯對話框相關
const categoryDialogVisible = ref(false);
const isEdit = ref(false);
const categoryForm = ref<{
  id?: number;
  name: string;
  description: string;
  parent_id: number;
  icon_url?: string | null;
}>({
  name: "",
  description: "",
  parent_id: 0,
  icon_url: null,
});

// 過濾分類函數
const filteredCategories = computed(() => {
  if (!searchName.value.trim()) return categories.value;

  const keyword = searchName.value.toLowerCase().trim();
  return categories.value.filter((category) =>
    category.name.toLowerCase().includes(keyword)
  );
});

// 當前頁面顯示的分類
const displayCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCategories.value.slice(start, end);
});

// 可作為父分類的選項（不包括自己）
const parentCategoryOptions = computed(() => {
  if (!isEdit.value) return categories.value;
  return categories.value.filter((cat) => cat.id !== categoryForm.value.id);
});

// 計算顯示的索引
const calculateIndex = (index: number) => {
  return (currentPage.value - 1) * pageSize.value + index + 1;
};

// 格式化日期
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toISOString().split("T")[0];
};

// 取得父分類名稱
const getParentCategoryName = (parentId: number | null) => {
  if (!parentId || parentId === 0) return "無 (頂級分類)";
  const parent = categories.value.find((cat) => cat.id === parentId);
  return parent ? parent.name : "未知分類";
};

// 判斷是否有子分類
const hasChildren = (categoryId: number | null | undefined) => {
  if (!categoryId) return false;
  return categories.value.some((cat) => cat.parent_id === categoryId);
};

// 獲取所有分類
const fetchCategories = async () => {
  try {
    loading.value = true;
    const res = await axios.get("http://127.0.0.1:3007/categories");

    if (res.data.code === 0) {
      categories.value = res.data.data || [];
    } else {
      ElMessage.error(res.data.message || "獲取分類失敗");
    }
  } catch (err) {
    console.error("獲取分類失敗", err);
    ElMessage.error("獲取分類失敗");
  } finally {
    loading.value = false;
  }
};

// 重設處理
const handleReset = () => {
  searchName.value = "";
  currentPage.value = 1;
};

// 頁面變更處理
const handlePageChange = (val: number) => {
  currentPage.value = val;
};

// 打開新增對話框
const openAddDialog = () => {
  isEdit.value = false;
  categoryForm.value = {
    name: "",
    description: "",
    parent_id: 0,
    icon_url: null,
  };
  categoryDialogVisible.value = true;
};

// 打開編輯對話框
const openEditDialog = (category: Category) => {
  isEdit.value = true;
  categoryForm.value = {
    id: category.id,
    name: category.name,
    description: category.description || "",
    parent_id: category.parent_id,
    icon_url: category.icon_url,
  };
  categoryDialogVisible.value = true;
};

// 提交分類表單
const submitCategoryForm = async () => {
  if (!categoryForm.value.name.trim()) {
    ElMessage.warning("分類名稱不能為空");
    return;
  }

  try {
    const formData = {
      name: categoryForm.value.name.trim(),
      description: categoryForm.value.description.trim() || "",
      parent_id: categoryForm.value.parent_id,
      icon_url: categoryForm.value.icon_url,
    };

    let res;
    if (isEdit.value && categoryForm.value.id) {
      // 編輯現有分類
      res = await axios.put(
        `http://127.0.0.1:3007/categories/${categoryForm.value.id}`,
        formData
      );
    } else {
      // 新增分類
      res = await axios.post("http://127.0.0.1:3007/categories", formData);
    }

    if (res.data.code === 0) {
      ElMessage.success(isEdit.value ? "分類已更新" : "分類已新增");
      categoryDialogVisible.value = false;
      fetchCategories(); // 重新加載分類列表
    } else {
      ElMessage.error(res.data.message || "操作失敗");
    }
  } catch (err) {
    console.error("提交分類表單錯誤", err);
    ElMessage.error("操作失敗");
  }
};

// 打開刪除對話框
const openDelete = (id: number, name: string) => {
  selectedCategoryId.value = id;
  selectedCategoryName.value = name;
  deleteDialogVisible.value = true;
};

// 確認刪除
const confirmDelete = async () => {
  if (!selectedCategoryId.value) return;

  // 檢查是否有子分類
  if (hasChildren(selectedCategoryId.value)) {
    ElMessage.warning("請先移除子分類後再刪除此分類");
    return;
  }

  try {
    const res = await axios.delete(
      `http://127.0.0.1:3007/categories/${selectedCategoryId.value}`
    );

    if (res.data.code === 0) {
      ElMessage.success(`已刪除分類「${selectedCategoryName.value}」`);
      fetchCategories(); // 重新加載分類列表
      deleteDialogVisible.value = false;
    } else {
      ElMessage.error(res.data.message || "刪除失敗");
    }
  } catch (err: any) {
    console.error("刪除錯誤", err);

    // 判斷是否為外鍵約束錯誤
    if (err.response?.data?.message?.includes("foreign key constraint fails")) {
      ElMessage.error(
        `無法刪除分類「${selectedCategoryName.value}」，因為有商品正在使用此分類`
      );
    } else {
      ElMessage.error("刪除失敗");
    }
  }
};

// 生命週期鉤子
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped lang="scss">
@import "@/assets/css/common.scss";

.category-management {
  .title {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;

    .titleName {
      width: 200px;
      font-size: 32px;
      font-weight: 600;
      position: relative;
      color: $primary-b-d;

      &::before {
        content: "";
        position: absolute;
        left: -12px;
        top: 0;
        width: 5px;
        height: 60%;
        transform: translateY(40%);
        background-color: $primary-y;
        align-items: center;
        border-radius: 2px;
      }
    }

    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .searchArea {
    display: flex;
    margin-top: 16px;
    margin-bottom: 16px;
    gap: 16px;

    .search-input {
      width: 300px;
    }
  }

  .listArea {
    background-color: $bg-1;
    padding: 16px;
    margin-top: 16px;
    border-radius: 8px;

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid black;
      border-radius: 8px;
      overflow: hidden;
      color: $text-d;

      thead {
        background-color: $primary-b-ll;
      }

      thead tr {
        height: 40px;
      }

      th,
      td {
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 16px;
      }

      .description-cell {
        white-space: normal;
        max-width: 250px;
        word-break: break-word;
      }

      tbody tr {
        height: 50px;
      }

      .hover-effect-l:hover {
        background-color: #e0e0e0;
        transition: background-color 0.2s ease;
      }

      .hover-effect-d:hover {
        background-color: #c5c5c5;
        transition: background-color 0.2s ease;
      }

      .edit-btn,
      .delete-btn {
        color: $primary-b-d;
        text-decoration: none;
        background-color: $primary-b-ll;
        padding: 4px 8px;
        border-radius: 5px;
        cursor: pointer;
        margin: 0 2px;
      }

      .edit-btn:hover {
        background-color: $primary-b;
        color: white;
      }

      .delete-btn:hover {
        background-color: #f44336;
        color: white;
      }
    }
  }

  .pageNation {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .warning-message {
    margin-top: 12px;
  }
}

:deep(.el-input .el-input__wrapper) {
  border-radius: 8px;
  height: 32px;
}

:deep(.el-button) {
  border-radius: 8px;
  background-color: $primary-y-l;
  color: $text-d;
  &:active {
    border: 1px solid $primary-b-d;
  }
}

:deep(.resetBtn.el-button) {
  background-color: $primary-b-l !important;
  margin-left: 5px;
}

:deep(.cancel.el-button) {
  border-radius: 8px;
  background-color: #e5eaf3 !important;
  color: $text-d;
}

:deep(.el-button--danger) {
  background-color: #f44336 !important; // 或你想要的紅色
  border-color: #f44336 !important;
  color: white !important;
}

:deep(.el-button--primary) {
  background-color: $primary-b-d !important;
  border-color: $primary-b-d !important;
  color: white !important;
}
</style>

<template>
  <div class="tag-management">
    <div class="title">
      <div class="titleName">標籤管理</div>
    </div>

    <div class="line"></div>

    <!-- 搜索區域 -->
    <div class="searchArea">
      <el-input
        v-model="searchName"
        placeholder="請輸入標籤名稱"
        class="search-input"
      />

      <el-button @click="handleReset" class="resetBtn">重設</el-button>
    </div>

    <!-- 標籤列表 -->
    <div class="listArea">
      <table style="border: none">
        <colgroup>
          <col style="width: 50px" />
          <!-- 筆數 -->
          <col style="width: 50px" />
          <!-- 名稱 -->
          <col style="width: 300px" />
          <!-- 創建時間 -->
          <col style="width: 120px" />
          <!-- 操作 -->
        </colgroup>
        <thead>
          <tr>
            <th>筆數</th>
            <th>標籤名稱</th>
            <th>創建時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(tag, index) in displayTags"
            :key="tag.id"
            :class="{
              gray: index % 2 === 1,
              'hover-effect-d': index % 2 === 1,
              'hover-effect-l': index % 2 === 0,
            }"
          >
            <td>{{ calculateIndex(index) }}</td>
            <td>{{ tag.name }}</td>
            <td>{{ formatDate(tag.created_time) }}</td>
            <td>
              <span class="delete-btn" @click="openDelete(tag.id, tag.name)"
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
        :total="filteredTags.length"
        @current-change="handlePageChange"
        background
      />
    </div>

    <!-- 刪除確認對話框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="刪除確認"
      width="500"
      align-center
    >
      <span>確定要刪除標籤「{{ selectedTagName }}」嗎？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false" class="cancel"
            >取消</el-button
          >
          <el-button type="danger" @click="confirmDelete">刪除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

// 定義標籤介面
interface Tag {
  id: number;
  name: string;
  description: string | null;
  created_time: string;
  update_time: string;
}

// 狀態變數
const tags = ref<Tag[]>([]); // 所有標籤
const searchName = ref(""); // 搜索關鍵字
const loading = ref(false); // 載入狀態

// 分頁相關
const currentPage = ref(1);
const pageSize = ref(10);

// 刪除對話框相關
const deleteDialogVisible = ref(false);
const selectedTagId = ref<number | null>(null);
const selectedTagName = ref("");

// 過濾標籤函數
const filteredTags = computed(() => {
  if (!searchName.value.trim()) return tags.value;

  const keyword = searchName.value.toLowerCase().trim();
  return tags.value.filter((tag) => tag.name.toLowerCase().includes(keyword));
});

// 當前頁面顯示的標籤
const displayTags = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTags.value.slice(start, end);
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

// 獲取所有標籤
const fetchTags = async () => {
  try {
    loading.value = true;
    const res = await axios.get("http://127.0.0.1:3007/tags");

    if (res.data.code === 0) {
      tags.value = res.data.data || [];
    } else {
      ElMessage.error(res.data.message || "獲取標籤失敗");
    }
  } catch (err) {
    console.error("獲取標籤失敗", err);
    ElMessage.error("獲取標籤失敗");
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

// 打開刪除對話框
const openDelete = (id: number, name: string) => {
  selectedTagId.value = id;
  selectedTagName.value = name;
  deleteDialogVisible.value = true;
};

// 確認刪除
const confirmDelete = async () => {
  if (!selectedTagId.value) return;

  try {
    const res = await axios.delete(
      `http://127.0.0.1:3007/tags/${selectedTagId.value}`
    );

    if (res.data.code === 0) {
      ElMessage.success(`已刪除標籤「${selectedTagName.value}」`);
      fetchTags(); // 重新加載標籤列表
      deleteDialogVisible.value = false;
    } else {
      ElMessage.error(res.data.message || "刪除失敗");
    }
  } catch (err) {
    console.error("刪除錯誤", err);
    ElMessage.error("刪除失敗");
  }
};

// 生命週期鉤子
onMounted(() => {
  fetchTags();
});
</script>

<style scoped lang="scss">
@import "@/assets/css/common.scss";

.tag-management {
  .title {
    display: flex;
    width: 100%;
    align-items: center;

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

      .delete-btn {
        color: $primary-b-d;
        text-decoration: none;
        background-color: $primary-b-ll;
        padding: 4px 8px;
        border-radius: 5px;
        cursor: pointer;
        &:hover {
          background-color: #f44336;
          color: white;
        }
      }
    }
  }

  .pageNation {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
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
</style>

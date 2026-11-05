<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Interfaces\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements RepositoryInterface
{
    /** Kolom yang dicari saat ada kata kunci (memakai ilike, tidak membedakan huruf besar/kecil). */
    protected array $searchable = [];

    /** Relasi yang selalu dimuat. */
    protected array $with = [];

    protected string $orderBy = 'id';

    protected string $orderDir = 'asc';

    public function __construct(protected Model $model)
    {
    }

    protected function query(): Builder
    {
        return $this->model->newQuery()->with($this->with);
    }

    protected function applySearch(Builder $query, ?string $search): Builder
    {
        $search = trim((string) $search);

        if ($search === '' || $this->searchable === []) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($search) {
            foreach ($this->searchable as $kolom) {
                $q->orWhere($kolom, 'ilike', "%{$search}%");
            }
        });
    }

    public function paginate(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return $this->applySearch($this->query(), $search)
            ->orderBy($this->orderBy, $this->orderDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function all(): Collection
    {
        return $this->query()->orderBy($this->orderBy, $this->orderDir)->get();
    }

    public function find(int|string $id): Model
    {
        return $this->query()->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return $this->model->newQuery()->create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        $record = $this->model->newQuery()->findOrFail($id);
        $record->update($data);

        return $record;
    }

    public function delete(int|string $id): bool
    {
        return (bool) $this->model->newQuery()->findOrFail($id)->delete();
    }
}

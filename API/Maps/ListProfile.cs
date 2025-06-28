using AutoMapper;

using API.Models;
using API.DTOs;

public class ListProfile : Profile {
    public ListProfile() {
        CreateMap<List, ListDTO>();

        CreateMap<List, ListMinimalDTO>()
            .ForMember(
                dest => dest.TMDB_IDs,
                opt => opt.MapFrom(src => src.ContentPartials.Select(c => c.TMDB_ID).ToList())
            );

    }
}